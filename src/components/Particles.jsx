import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

/* ================= UTIL ================= */

const defaultColors = ['#ffffff', '#ffffff', '#ffffff'];

const hexToRgb = hex => {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255
  ];
};

const getParticleColor = () => {
  const style = getComputedStyle(document.documentElement);
  const rgb = style.getPropertyValue('--particle-color').trim();
  const opacity = style.getPropertyValue('--particle-opacity').trim();

  return {
    color: rgb,
    opacity: parseFloat(opacity),
  };
};

/* ================= SHADERS ================= */

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec4 random;
attribute vec3 color;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSpread;
uniform float uBaseSize;
uniform float uSizeRandomness;

varying vec4 vRandom;
varying vec3 vColor;

void main() {
  vRandom = random;
  vColor = color;

  vec3 pos = position * uSpread;
  pos.z *= 10.0;

  vec4 mPos = modelMatrix * vec4(pos, 1.0);
  float t = uTime;

  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

  vec4 mvPos = viewMatrix * mPos;

  if (uSizeRandomness == 0.0) {
    gl_PointSize = uBaseSize;
  } else {
    gl_PointSize =
      (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) /
      length(mvPos.xyz);
  }

  gl_Position = projectionMatrix * mvPos;
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uAlphaParticles;

varying vec4 vRandom;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord.xy;
  float d = length(uv - 0.5);

  if (uAlphaParticles < 0.5) {
    if (d > 0.5) discard;
    gl_FragColor = vec4(
      clamp(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 0.0, 1.0),
      1.0
    );
  } else {
    float circle = smoothstep(0.5, 0.4, d) * 0.8;
    gl_FragColor = vec4(
      clamp(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 0.0, 1.0),
      circle
    );
  }
}
`;

/* ================= COMPONENT ================= */

const Particles = ({
  particleCount = 300,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = true,
  particleBaseSize = 120,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = Math.min(window.devicePixelRatio, 2),
  className = ''
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ===== Renderer ===== */
    const renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true
    });

    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    /* ===== FIX UTAMA: KUNCI CANVAS ===== */
    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      display: 'block'
    });

    gl.clearColor(0, 0, 0, 0);

    /* ===== Camera ===== */
    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({
        aspect: gl.canvas.width / gl.canvas.height
      });
    };

    window.addEventListener('resize', resize);
    resize();

    /* ===== Mouse ===== */
    const handleMouseMove = e => {
      const r = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -(((e.clientY - r.top) / r.height) * 2 - 1)
      };
    };

    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    /* ===== Geometry ===== */
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors?.length ? particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, l;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        l = x * x + y * y + z * z;
      } while (l > 1 || l === 0);

      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);

      const c = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(c, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 }
      },
      transparent: true,
      depthTest: false
    });

    const mesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry,
      program
    });

    /* ===== RAF (DELAYED START) ===== */
    let raf;
    let last = performance.now();
    let elapsed = 0;

    const update = t => {
      raf = requestAnimationFrame(update);
      const delta = t - last;
      last = t;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        mesh.position.x = -mouseRef.current.x * particleHoverFactor;
        mesh.position.y = -mouseRef.current.y * particleHoverFactor;
      }

      if (!disableRotation) {
        mesh.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        mesh.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        mesh.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: mesh, camera });
    };

    requestAnimationFrame(() => {
      raf = requestAnimationFrame(update);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (moveParticlesOnHover) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      container.contains(gl.canvas) && container.removeChild(gl.canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
};

export default Particles;

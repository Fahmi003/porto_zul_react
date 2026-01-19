import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

import MouseGlow from './MouseGlow'
import Particles from './Particles'

export default function Home() {
  const sectionRef = useRef(null);
  const textRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
      })
    }, textRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="home"
      ref={sectionRef} 
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: 'var(--hero-bg)' }}
    >
      {/* GRADIENT BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              var(--hero-grad-from),
              var(--hero-grad-via),
              var(--hero-grad-to)
            )
          `
        }}
      />

      {/* PARTICLES */}
      <Particles
        className="absolute inset-1 z-[1]"
        moveParticlesOnHover={false}
      />

      {/* MOUSE GLOW */}
      <MouseGlow className="z-[2]" />

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div ref={textRef} className="text-center">
          <p
            data-animate
            className="mb-4 text-sm tracking-[0.35em]"
            style={{ color: 'var(--hero-text-muted)' }}
          >
            HI, I AM
          </p>

          <h1
            data-animate
            className="mb-6 font-[cursive] text-5xl md:text-7xl"
            style={{ color: 'var(--hero-text-main)' }}
          >
            Zulfahmi Ridha
          </h1>

          <p
            data-animate
            className="text-xs tracking-[0.4em]"
            style={{ color: 'var(--hero-text-muted)' }}
          >
            FRONT-END DEVELOPER
          </p>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--hero-text-main)"
          className="animate-bounce opacity-50"
        >
          <path
            d="M7 13l5 5 5-5M7 6l5 5 5-5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}

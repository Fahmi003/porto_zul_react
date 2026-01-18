import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroText() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-animate]', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="text-center">
      
      <p
        className="mb-4 text-sm tracking-[0.35em]"
        style={{ color: 'var(--hero-text-muted)' }}
      >
        HI, I AM
      </p>

        <h1
            className="mb-6 font-[cursive] text-5xl md:text-7xl"
            style={{ color: 'var(--hero-text-main)' }}
            >
            Zulfahmi Ridha
        </h1>

      <p
        className="text-xs tracking-[0.4em]"
        style={{ color: 'var(--hero-text-muted)' }}
      >
        FRONT-END DEVELOPER
      </p>

    </div>
  );
}

    import HeroText from './HomeText';
    import MouseGlow from './MouseGlow'
    import Particles from './Particles'

    export default function Home() {
    return (
        <section
            className="relative min-h-screen w-full overflow-hidden"
            style={{ backgroundColor: 'var(--hero-bg)' }}
        >
            {/* GRADIENT BACKGROUND */}
            <div
              className="absolute inset-0 z-[1]"
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
            
            {/* Particle */}
            <Particles className="absolute inset-1 z-1" 
                moveParticlesOnHover={false}
            />

            {/* MOUSE GLOW*/}
            <MouseGlow/>

            {/* CONTENT */}
            <div className="relative z-10 flex min-h-screen items-center justify-center">
            <HeroText />
            </div>
        </section>
    );
    }

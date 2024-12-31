import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

const ParticleBackground = () => {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      className="particles"
      init={particlesInit}
      options={{
        background: {
          color: {
            value: "#f0f2f5",
          },
        },
        particles: {
          color: {
            value: "#2e7d32",
          },
          links: {
            color: "#2e7d32",
            distance: 140,
            enable: true,
            opacity: 0.25,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.2,
          },
          number: {
            value: 92,
          },
          opacity: {
            value: 0.35,
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
      }}
    />
  );
};

export default ParticleBackground; 
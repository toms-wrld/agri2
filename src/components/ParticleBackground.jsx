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
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
          },
          number: {
            value: 80,
          },
          opacity: {
            value: 0.3,
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
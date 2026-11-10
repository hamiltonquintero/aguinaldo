import React, { useEffect, useState } from 'react';

export default function AmbientParticles({ count = 15, active = true }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${15 + Math.random() * 10}s`,
      size: `${2 + Math.random() * 3}px`,
      opacity: 0.3 + Math.random() * 0.4,
      color: ['#f1b72e', '#fff', '#34d399', '#c41e3a'][Math.floor(Math.random() * 4)],
    }));

    setParticles(newParticles);
  }, [active, count]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="ambient-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="ambient-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            opacity: particle.opacity,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}

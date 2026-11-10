import React, { useEffect, useRef } from 'react';

export default function SnowEffect({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate flakes
    const flakeCount = Math.min(Math.floor((width * height) / 14000), 120);
    const flakes = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1, // radius
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 0.8 - 0.4,
        opacity: Math.random() * 0.7 + 0.3,
        swing: Math.random() * 2,
        swingSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.swing += f.swingSpeed;
        f.x += f.speedX + Math.sin(f.swing) * 0.5;
        f.y += f.speedY;

        // Wrap around
        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.85 }}
    />
  );
}


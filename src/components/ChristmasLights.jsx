import React, { useRef, useEffect } from 'react';

// Colores y brillos de los bombillos
const BULB_CONFIGS = [
  { fill: '#ef4444', glow: 'rgba(239,68,68,0.9)',   cap: '#7f1d1d' },
  { fill: '#fbbf24', glow: 'rgba(251,191,36,0.9)',  cap: '#78350f' },
  { fill: '#34d399', glow: 'rgba(52,211,153,0.9)',  cap: '#064e3b' },
  { fill: '#60a5fa', glow: 'rgba(96,165,250,0.9)',  cap: '#1e3a5f' },
  { fill: '#c084fc', glow: 'rgba(192,132,252,0.9)', cap: '#4c1d95' },
  { fill: '#fb7185', glow: 'rgba(251,113,133,0.9)', cap: '#881337' },
  { fill: '#fde047', glow: 'rgba(253,224,71,0.9)',  cap: '#713f12' },
  { fill: '#4ade80', glow: 'rgba(74,222,128,0.9)',  cap: '#14532d' },
];

const BULB_COUNT = 22;
const HEIGHT = 68;

export default function ChristmasLights() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = HEIGHT;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Pre-calcular posiciones de bombillos sobre una curva senoidal
    const getBulbPositions = (W) => {
      const positions = [];
      const spacing = W / (BULB_COUNT - 1);
      for (let i = 0; i < BULB_COUNT; i++) {
        const t = i / (BULB_COUNT - 1);
        const x = t * W;
        // Curva catenaria suavizada
        const catenary = Math.pow(t - 0.5, 2) * 36;
        // Ondulación por segmento
        const wave = Math.sin(t * Math.PI * (BULB_COUNT / 2)) * 7;
        const y = 10 + catenary + wave;
        positions.push({ x, y, config: BULB_CONFIGS[i % BULB_CONFIGS.length] });
      }
      return positions;
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      timeRef.current += 0.03;
      const t = timeRef.current;

      const bulbs = getBulbPositions(W);

      // ── Cable ────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(0, 8);
      bulbs.forEach((b, i) => {
        if (i === 0) ctx.moveTo(b.x, b.y - 14);
        else ctx.lineTo(b.x, b.y - 14);
      });
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 3;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Bombillos ────────────────────────────────────────
      bulbs.forEach((b, i) => {
        const { x, y, config } = b;
        // Desfase individual para parpadeo independiente
        const phase = i * 0.65 + Math.sin(i * 1.3) * 2;
        const flicker = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.2 + phase));
        const bigGlow = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.8 + phase * 0.5));

        // ── Casquillo (compatible todos los browsers) ────────
        const sx = x - 4, sy = y - 18, sw = 8, sh = 7, sr = 2;
        ctx.beginPath();
        ctx.moveTo(sx + sr, sy);
        ctx.lineTo(sx + sw - sr, sy);
        ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + sr);
        ctx.lineTo(sx + sw, sy + sh - sr);
        ctx.quadraticCurveTo(sx + sw, sy + sh, sx + sw - sr, sy + sh);
        ctx.lineTo(sx + sr, sy + sh);
        ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh - sr);
        ctx.lineTo(sx, sy + sr);
        ctx.quadraticCurveTo(sx, sy, sx + sr, sy);
        ctx.closePath();
        ctx.fillStyle = config.cap;
        ctx.fill();

        // Halo exterior (glow suave)
        const glowGrad = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, 18 * bigGlow);
        glowGrad.addColorStop(0, config.glow.replace('0.9', `${0.4 * bigGlow}`));
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y + 4, 18 * bigGlow, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Cuerpo del bombillo (forma de gota)
        ctx.beginPath();
        ctx.ellipse(x, y + 4, 7, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = config.fill;
        ctx.globalAlpha = 0.5 + 0.5 * flicker;
        ctx.shadowBlur = 10 * flicker;
        ctx.shadowColor = config.glow;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Reflejo interior (brillo blanco)
        const refGrad = ctx.createRadialGradient(x - 2, y, 0, x, y + 4, 8);
        refGrad.addColorStop(0, `rgba(255,255,255,${0.6 * flicker})`);
        refGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.ellipse(x, y + 4, 7, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = refGrad;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="w-full relative z-20 pointer-events-none" style={{ height: HEIGHT }}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: HEIGHT, display: 'block' }}
      />
    </div>
  );
}

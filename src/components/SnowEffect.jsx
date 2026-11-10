import React, { useEffect, useRef } from 'react';

// ─── Dibuja a Papá Noel en canvas ─────────────────────────────
function drawSanta(ctx, x, y, scale = 1, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);

  // Trineo (rectángulo curvo — compatible con todos los browsers)
  ctx.beginPath();
  ctx.moveTo(-49, 18); ctx.lineTo(49, 18);
  ctx.quadraticCurveTo(55, 18, 55, 24);
  ctx.lineTo(55, 32); ctx.quadraticCurveTo(55, 38, 49, 38);
  ctx.lineTo(-49, 38); ctx.quadraticCurveTo(-55, 38, -55, 32);
  ctx.lineTo(-55, 24); ctx.quadraticCurveTo(-55, 18, -49, 18);
  ctx.closePath();
  ctx.fillStyle = '#8B4513';
  ctx.fill();
  ctx.strokeStyle = '#5a2d0c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Patines del trineo
  ctx.beginPath();
  ctx.moveTo(-50, 38); ctx.lineTo(-55, 44); ctx.lineTo(60, 44);
  ctx.moveTo(-25, 38); ctx.lineTo(-30, 44);
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cuerpo (rojo) — compatible todos los browsers
  ctx.beginPath();
  ctx.moveTo(-18, -20); ctx.lineTo(18, -20);
  ctx.quadraticCurveTo(22, -20, 22, -16);
  ctx.lineTo(22, 14); ctx.quadraticCurveTo(22, 18, 18, 18);
  ctx.lineTo(-18, 18); ctx.quadraticCurveTo(-22, 18, -22, 14);
  ctx.lineTo(-22, -16); ctx.quadraticCurveTo(-22, -20, -18, -20);
  ctx.closePath();
  ctx.fillStyle = '#c41e3a';
  ctx.fill();

  // Cinturón
  ctx.beginPath();
  ctx.rect(-22, 2, 44, 10);
  ctx.fillStyle = '#1a0a0a';
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-6, 3, 12, 8);
  ctx.fillStyle = '#f1b72e';
  ctx.fill();

  // Cabeza
  ctx.beginPath();
  ctx.arc(0, -32, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe0b2';
  ctx.fill();

  // Gorro — compatible todos los browsers
  ctx.beginPath();
  ctx.moveTo(-14, -38);
  ctx.lineTo(-10, -65);
  ctx.lineTo(14, -65);
  ctx.lineTo(16, -38);
  ctx.closePath();
  ctx.fillStyle = '#c41e3a';
  ctx.fill();
  // Pompón del gorro
  ctx.beginPath();
  ctx.arc(2, -68, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  // Borde del gorro
  ctx.beginPath();
  ctx.moveTo(-14, -42); ctx.lineTo(14, -42);
  ctx.quadraticCurveTo(18, -42, 18, -38);
  ctx.lineTo(18, -34); ctx.quadraticCurveTo(18, -32, 14, -32);
  ctx.lineTo(-14, -32); ctx.quadraticCurveTo(-18, -32, -18, -34);
  ctx.lineTo(-18, -38); ctx.quadraticCurveTo(-18, -42, -14, -42);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();

  // Barba
  ctx.beginPath();
  ctx.arc(0, -22, 14, 0.2, Math.PI - 0.2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Ojos
  ctx.beginPath();
  ctx.arc(-5, -36, 2, 0, Math.PI * 2);
  ctx.arc(5, -36, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#1a0a0a';
  ctx.fill();

  // Nariz
  ctx.beginPath();
  ctx.arc(0, -32, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b35';
  ctx.fill();

  // Brazo derecho con bastón
  ctx.beginPath();
  ctx.moveTo(22, -10);
  ctx.quadraticCurveTo(45, -5, 42, 15);
  ctx.strokeStyle = '#c41e3a';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
  // Bastón
  ctx.beginPath();
  ctx.moveTo(42, 15); ctx.lineTo(44, 30);
  ctx.arc(50, 30, 6, Math.PI, 0);
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Renos (simples) a la izquierda
  const renoColors = ['#8B6914', '#7a5c10', '#9a7520'];
  for (let r = 0; r < 3; r++) {
    const rx = -80 - r * 36;
    ctx.save();
    ctx.translate(rx, 0);

    // Cuerpo reno
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = renoColors[r];
    ctx.fill();

    // Cabeza reno
    ctx.beginPath();
    ctx.arc(18, -2, 9, 0, Math.PI * 2);
    ctx.fillStyle = renoColors[r];
    ctx.fill();

    // Hocico
    ctx.beginPath();
    ctx.arc(26, 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = r === 0 ? '#ff4444' : '#c0855a'; // reno rojo al frente
    ctx.fill();

    // Astas
    ctx.beginPath();
    ctx.moveTo(14, -8);
    ctx.lineTo(10, -22); ctx.lineTo(6, -18);
    ctx.moveTo(10, -22); ctx.lineTo(15, -26);
    ctx.moveTo(20, -8);
    ctx.lineTo(22, -24); ctx.lineTo(18, -20);
    ctx.moveTo(22, -24); ctx.lineTo(26, -28);
    ctx.strokeStyle = renoColors[r];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Patitas
    ctx.beginPath();
    ctx.moveTo(-8, 18); ctx.lineTo(-8, 32);
    ctx.moveTo(0,  18); ctx.lineTo(0,  32);
    ctx.moveTo(8,  18); ctx.lineTo(8,  32);
    ctx.strokeStyle = renoColors[r];
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  // Cadena del trineo a renos
  ctx.beginPath();
  ctx.moveTo(-55, 25);
  for (let r = 0; r < 3; r++) {
    ctx.lineTo(-80 - r * 36 + 18, 10);
  }
  ctx.strokeStyle = 'rgba(255,215,0,0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// ─── Dibuja un muñeco de nieve en canvas ──────────────────────
function drawSnowman(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Sombra
  ctx.beginPath();
  ctx.ellipse(0, 48, 20, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // Cuerpo inferior
  ctx.beginPath();
  ctx.arc(0, 28, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(230,245,255,0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,220,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cuerpo medio
  ctx.beginPath();
  ctx.arc(0, 2, 16, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(240,250,255,0.95)';
  ctx.fill();
  ctx.stroke();

  // Cabeza
  ctx.beginPath();
  ctx.arc(0, -18, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.stroke();

  // Sombrero
  ctx.beginPath();
  ctx.ellipse(0, -28, 14, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-9, -46, 18, 18);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-6, -48, 12, 4);
  ctx.fillStyle = '#c41e3a';
  ctx.fill();

  // Ojos
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath(); ctx.arc(-4, -20, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -20, 2, 0, Math.PI * 2); ctx.fill();

  // Nariz zanahoria
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(10, -16);
  ctx.lineTo(0, -15);
  ctx.closePath();
  ctx.fillStyle = '#ff6b35';
  ctx.fill();

  // Sonrisa (puntitos)
  for (let i = 0; i < 5; i++) {
    const angle = -0.6 + i * 0.3;
    ctx.beginPath();
    ctx.arc(Math.sin(angle) * 7, -13 + Math.cos(angle) * 7, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
  }

  // Botones
  ctx.fillStyle = '#1a1a2e';
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    ctx.arc(0, -4 + b * 8, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bufanda
  ctx.beginPath();
  ctx.arc(0, -8, 16, -0.8, Math.PI + 0.8);
  ctx.strokeStyle = '#c41e3a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.quadraticCurveTo(14, 2, 10, 10);
  ctx.strokeStyle = '#c41e3a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Brazos (ramas)
  ctx.beginPath();
  ctx.moveTo(-16, 2); ctx.lineTo(-34, -12);
  ctx.moveTo(-34, -12); ctx.lineTo(-38, -18);
  ctx.moveTo(-34, -12); ctx.lineTo(-28, -20);
  ctx.moveTo(16, 2); ctx.lineTo(34, -12);
  ctx.moveTo(34, -12); ctx.lineTo(38, -18);
  ctx.moveTo(34, -12); ctx.lineTo(28, -20);
  ctx.strokeStyle = '#5a3010';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

// ─── Estrella fugaz ───────────────────────────────────────────
function drawShootingStar(ctx, x, y, length, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const grad = ctx.createLinearGradient(x, y, x + length, y + length * 0.4);
  grad.addColorStop(0, 'white');
  grad.addColorStop(0.3, 'rgba(255,243,176,0.8)');
  grad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + length, y + length * 0.4);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  // Destello en la punta
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
export default function SnowEffect({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // ── Copos de nieve ────────────────────────────────────
    const flakeCount = Math.min(Math.floor((W * H) / 10000), 160);
    const flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 3.5 + 0.8,
      vy: Math.random() * 1.3 + 0.5,
      vx: Math.random() * 0.6 - 0.3,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.025 + 0.008,
      opacity: Math.random() * 0.65 + 0.25,
    }));

    // ── Papá Noel ─────────────────────────────────────────
    const isMobile = W < 640;
    const santaScale = isMobile ? 0.45 : 0.65;
    const santaY = isMobile ? H * 0.08 : H * 0.1;
    const santaW = isMobile ? 200 : 310; // ancho visual del sprite
    let santaX = -santaW;               // empieza fuera por la izquierda
    const santaSpeed = isMobile ? 0.6 : 0.9;
    let santaBob = 0;

    // ── Muñecos de nieve ──────────────────────────────────
    const snowmanScale = isMobile ? 0.45 : 0.6;
    const snowmanY = H - (isMobile ? 55 : 72); // pies en el suelo
    const snowmen = [
      { x: -120, speed: 0.8, bob: 0, bobSpeed: 0.08, phase: 0 },
      { x: -400, speed: 0.65, bob: 0, bobSpeed: 0.07, phase: 1.5 },
    ];

    // ── Estrellas fugaces ─────────────────────────────────
    const shootingStars = [
      { x: W * 0.2, y: H * 0.05, length: 120, opacity: 0, timer: 180, interval: 280 },
      { x: W * 0.7, y: H * 0.08, length: 90,  opacity: 0, timer: 420, interval: 350 },
    ];
    let shootTick = 0;

    // ── Loop principal ────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // --- Estrellas fugaces ---
      shootTick++;
      shootingStars.forEach((ss) => {
        if (shootTick % ss.interval === 0) {
          ss.x = Math.random() * W * 0.6 + W * 0.1;
          ss.y = Math.random() * H * 0.15;
          ss.opacity = 1;
          ss.timer = 60;
        }
        if (ss.opacity > 0) {
          ss.opacity = Math.max(0, ss.opacity - 0.018);
          drawShootingStar(ctx, ss.x, ss.y, ss.length, ss.opacity);
          ss.x += 2.5;
          ss.y += 1;
        }
      });

      // --- Copos ---
      flakes.forEach((f) => {
        f.swing += f.swingSpeed;
        f.x += f.vx + Math.sin(f.swing) * 0.5;
        f.y += f.vy;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        if (f.x > W + 5) f.x = 0;
        if (f.x < -5)    f.x = W;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(200,230,255,0.9)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // --- Muñecos de nieve ---
      snowmen.forEach((sm) => {
        sm.x += sm.speed;
        sm.bob += sm.bobSpeed;
        const bobY = Math.abs(Math.sin(sm.bob)) * -16;
        if (sm.x > W + 150) sm.x = -150;
        drawSnowman(ctx, sm.x, snowmanY + bobY, snowmanScale);
      });

      // --- Papá Noel ---
      santaBob += 0.04;
      santaX += santaSpeed;
      if (santaX > W + santaW) santaX = -santaW;
      const bobOffset = Math.sin(santaBob) * 10;
      drawSanta(ctx, santaX, santaY + bobOffset, santaScale);

      raf = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.92 }}
    />
  );
}

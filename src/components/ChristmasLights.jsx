import React from 'react';

export default function ChristmasLights() {
  const bulbColors = [
    { bg: 'bg-red-500', glow: 'shadow-[0_0_12px_#ef4444]', anim: 'animate-pulse' },
    { bg: 'bg-amber-400', glow: 'shadow-[0_0_14px_#fbbf24]', anim: 'animate-twinkle' },
    { bg: 'bg-emerald-400', glow: 'shadow-[0_0_12px_#34d399]', anim: 'animate-pulse' },
    { bg: 'bg-blue-400', glow: 'shadow-[0_0_12px_#60a5fa]', anim: 'animate-twinkle' },
    { bg: 'bg-purple-400', glow: 'shadow-[0_0_12px_#c084fc]', anim: 'animate-pulse' },
    { bg: 'bg-yellow-300', glow: 'shadow-[0_0_14px_#fde047]', anim: 'animate-twinkle' },
  ];

  // Repeat 24 bulbs across top
  const bulbs = Array.from({ length: 28 });

  return (
    <div className="w-full overflow-hidden pointer-events-none relative z-20 h-9 flex justify-between items-start px-2">
      {/* Garland wire */}
      <div className="absolute top-1 left-0 right-0 h-[2px] bg-emerald-950/80 border-b border-emerald-800/40" />

      {bulbs.map((_, i) => {
        const style = bulbColors[i % bulbColors.length];
        const delay = (i % 5) * 0.3;
        return (
          <div
            key={i}
            className="relative flex flex-col items-center"
            style={{ animationDelay: `${delay}s` }}
          >
            {/* Socket */}
            <div className="w-1.5 h-1.5 bg-emerald-900 rounded-xs z-10" />
            {/* Bulb */}
            <div
              className={`w-3 h-4 rounded-full ${style.bg} ${style.glow} ${style.anim} transform origin-top transition-transform hover:scale-125`}
              style={{
                animationDuration: `${1.8 + (i % 3) * 0.4}s`,
                borderRadius: '50% 50% 55% 55% / 40% 40% 60% 60%',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}


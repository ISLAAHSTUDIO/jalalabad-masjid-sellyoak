import React, { memo } from 'react';

interface AnimatedBackgroundProps {
  theme?: 'light' | 'dark';
  enabled?: boolean;
  isHeroContained?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = memo(({ 
  theme = 'dark', 
  enabled = true,
  isHeroContained = false
}) => {
  if (!enabled) return null;

  // Staggered particle configuration for silky smooth organic upward drift
  const particles = [
    { x: '8%', size: 2.5, duration: isHeroContained ? 18 : 24, delay: 0 },
    { x: '16%', size: 2, duration: isHeroContained ? 22 : 28, delay: -6 },
    { x: '24%', size: 3.5, duration: isHeroContained ? 16 : 22, delay: -10 },
    { x: '35%', size: 2, duration: isHeroContained ? 25 : 30, delay: -4 },
    { x: '44%', size: 2.5, duration: isHeroContained ? 20 : 26, delay: -12 },
    { x: '52%', size: 2, duration: isHeroContained ? 21 : 27, delay: -8 },
    { x: '63%', size: 3.5, duration: isHeroContained ? 17 : 23, delay: -14 },
    { x: '72%', size: 2, duration: isHeroContained ? 23 : 29, delay: -3 },
    { x: '81%', size: 2.5, duration: isHeroContained ? 19 : 25, delay: -11 },
    { x: '90%', size: 2, duration: isHeroContained ? 24 : 30, delay: -2 },
    { x: '95%', size: 3, duration: isHeroContained ? 18 : 24, delay: -7 },
  ];

  // 13 Luminous God-Rays with custom angles, widths, durations, and staggered delays
  const rays = [
    { angle: '-68deg', width: isHeroContained ? '10%' : '8vmin', duration: isHeroContained ? '12.5s' : '7.5s', delay: '-1.8s' },
    { angle: '-56deg', width: isHeroContained ? '13%' : '11vmin', duration: isHeroContained ? '14.8s' : '9.0s', delay: '-4.6s' },
    { angle: '-44deg', width: isHeroContained ? '11%' : '9vmin', duration: isHeroContained ? '11.8s' : '7.0s', delay: '-1.2s' },
    { angle: '-32deg', width: isHeroContained ? '14%' : '13vmin', duration: isHeroContained ? '15.5s' : '9.8s', delay: '-6.2s' },
    { angle: '-20deg', width: isHeroContained ? '10%' : '8vmin', duration: isHeroContained ? '13.0s' : '8.0s', delay: '-3.8s' },
    { angle: '-10deg', width: isHeroContained ? '13%' : '12vmin', duration: isHeroContained ? '14.0s' : '8.6s', delay: '-5.2s' },
    { angle: '0deg',   width: isHeroContained ? '12%' : '10vmin', duration: isHeroContained ? '12.2s' : '7.2s', delay: '-1.5s' },
    { angle: '10deg',  width: isHeroContained ? '13%' : '12vmin', duration: isHeroContained ? '15.2s' : '9.5s', delay: '-6.8s' },
    { angle: '20deg',  width: isHeroContained ? '10%' : '8vmin', duration: isHeroContained ? '12.8s' : '7.8s', delay: '-2.9s' },
    { angle: '32deg',  width: isHeroContained ? '14%' : '13vmin', duration: isHeroContained ? '16.0s' : '10.2s', delay: '-4.2s' },
    { angle: '44deg',  width: isHeroContained ? '11%' : '9vmin', duration: isHeroContained ? '12.0s' : '7.2s', delay: '-1.0s' },
    { angle: '56deg',  width: isHeroContained ? '13%' : '11vmin', duration: isHeroContained ? '14.5s' : '8.8s', delay: '-5.6s' },
    { angle: '68deg',  width: isHeroContained ? '10%' : '8vmin', duration: isHeroContained ? '13.4s' : '8.2s', delay: '-3.2s' },
  ];

  return (
    <div 
      className={`celestial-bg ${isHeroContained ? 'celestial-contained' : ''} ${theme === 'dark' ? 'celestial-dark' : 'celestial-light'}`}
      aria-hidden="true"
    >
      {/* Rotating God-Rays Sunburst */}
      <div className="celestial-sunburst" />

      {/* Main Swaying Radiant Light Beams */}
      <div className="celestial-rays">
        {rays.map((ray, i) => (
          <span 
            key={i} 
            className="celestial-ray"
            style={{
              '--r': ray.angle,
              '--w': ray.width,
              '--bd': ray.duration,
              '--dl': ray.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Pulsing Ambient Glow Behind Book */}
      <div className="celestial-glow" />

      {/* Glowing Open Holy Quran SVG */}
      <svg className="celestial-book" viewBox="0 0 640 220" aria-hidden="true">
        <defs>
          <linearGradient id="quran-pg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff7e0" />
            <stop offset="100%" stopColor="#d9b98a" />
          </linearGradient>
          <linearGradient id="quran-cov-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b3a24" />
            <stop offset="100%" stopColor="#2a1810" />
          </linearGradient>
          <filter id="quran-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#f59e0b" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Cover */}
        <path 
          d="M320 60 C240 22 120 18 30 44 L18 190 C120 160 240 164 320 196 C400 164 520 160 622 190 L610 44 C520 18 400 22 320 60 Z" 
          fill="url(#quran-cov-grad)"
          filter="url(#quran-glow-filter)"
        />

        {/* Pages */}
        <path 
          d="M320 52 C250 22 140 20 52 42 L44 176 C140 150 250 152 320 182 C390 152 500 150 596 176 L588 42 C500 20 390 22 320 52 Z" 
          fill="url(#quran-pg-grad)"
        />

        {/* Spine Divider */}
        <path d="M320 52 L320 182" stroke="#ffffff" strokeWidth="6" opacity="0.95" strokeLinecap="round" />

        {/* Calligraphic Ayah Lines */}
        <g stroke="#8a6b45" strokeWidth="3" opacity="0.55" strokeLinecap="round" fill="none">
          <path d="M84 66 C160 50 240 50 300 66" />
          <path d="M80 88 C160 72 240 72 300 88" />
          <path d="M78 110 C160 94 240 94 300 110" />
          <path d="M76 132 C160 116 240 116 300 132" />
          
          <path d="M340 66 C400 50 480 50 556 66" />
          <path d="M340 88 C400 72 480 72 560 88" />
          <path d="M340 110 C400 94 480 94 562 110" />
          <path d="M340 132 C400 116 480 116 564 132" />
        </g>
      </svg>

      {/* Floating Stardust Particles */}
      <div className="celestial-particles">
        {particles.map((p, i) => (
          <i
            key={i}
            style={{
              '--x': p.x,
              '--s': `${p.size}px`,
              '--d': `${p.duration}s`,
              '--dl': `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Readability Veil & Vignette */}
      <div className="celestial-veil" />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

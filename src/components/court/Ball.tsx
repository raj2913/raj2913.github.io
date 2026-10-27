// A basketball drawn in SVG: pebbled leather, deep seams, and a cool rim light from the arena.
export function Ball({ className = "", id = "ball" }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}-body`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ff9a5c" />
          <stop offset="28%" stopColor="#f2621f" />
          <stop offset="62%" stopColor="#b8410d" />
          <stop offset="100%" stopColor="#3a1203" />
        </radialGradient>
        <filter id={`${id}-pebble`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx="100" cy="100" r="96" fill="#000" filter={`url(#${id}-pebble)`} opacity="0.5" />
        <g fill="none" stroke="#1a0802" strokeWidth="4.2" strokeLinecap="round">
          <path d="M4 92 C 60 112, 140 112, 196 92" />
          <path d="M104 4 C 84 60, 84 140, 104 196" />
          <path d="M36 22 C 70 60, 70 140, 36 178" />
          <path d="M168 24 C 136 62, 136 138, 168 176" />
        </g>
        <circle cx="100" cy="100" r="93" fill="none" stroke="#cfe9ff" strokeOpacity="0.4" strokeWidth="3" strokeDasharray="120 600" strokeDashoffset="-10" style={{ filter: "blur(1.5px)" }} />
        <ellipse cx="70" cy="56" rx="26" ry="14" fill="#fff" opacity="0.07" transform="rotate(-30 70 56)" />
      </g>
    </svg>
  );
}

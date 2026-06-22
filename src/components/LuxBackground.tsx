/**
 * Luxuriöser, animierter Goldwellen-Hintergrund.
 * Rein dekorativ (aria-hidden), liegt hinter dem Inhalt.
 */
export default function LuxBackground() {
  return (
    <div id="lux-bg" aria-hidden="true">
      <div className="lux-orb orb1" />
      <div className="lux-orb orb2" />
      <div className="lux-orb orb3" />
      <div className="lux-shimmer" />
      <div className="lux-waves">
        <div className="wave wave3">
          <svg viewBox="0 0 2880 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lux-g3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fdf4d9" />
                <stop offset="1" stopColor="#f6d572" />
              </linearGradient>
            </defs>
            <path
              fill="url(#lux-g3)"
              d="M0,160 Q90,120 180,160 T360,160 T540,160 T720,160 T900,160 T1080,160 T1260,160 T1440,160 T1620,160 T1800,160 T1980,160 T2160,160 T2340,160 T2520,160 T2700,160 T2880,160 L2880,320 L0,320 Z"
            />
          </svg>
        </div>
        <div className="wave wave2">
          <svg viewBox="0 0 2880 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lux-g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fbe8a8" />
                <stop offset="1" stopColor="#e6b325" />
              </linearGradient>
            </defs>
            <path
              fill="url(#lux-g2)"
              d="M0,160 Q90,120 180,160 T360,160 T540,160 T720,160 T900,160 T1080,160 T1260,160 T1440,160 T1620,160 T1800,160 T1980,160 T2160,160 T2340,160 T2520,160 T2700,160 T2880,160 L2880,320 L0,320 Z"
            />
          </svg>
        </div>
        <div className="wave wave1">
          <svg viewBox="0 0 2880 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lux-g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f6d572" />
                <stop offset="1" stopColor="#c8930a" />
              </linearGradient>
            </defs>
            <path
              fill="url(#lux-g1)"
              d="M0,170 Q90,125 180,170 T360,170 T540,170 T720,170 T900,170 T1080,170 T1260,170 T1440,170 T1620,170 T1800,170 T1980,170 T2160,170 T2340,170 T2520,170 T2700,170 T2880,170 L2880,320 L0,320 Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

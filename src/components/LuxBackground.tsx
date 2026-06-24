/**
 * Luxuriöser, animierter Goldhintergrund mit goldenen Lichtwellen (Gold Rays).
 * Rein dekorativ (aria-hidden), liegt hinter dem Inhalt.
 */
export default function LuxBackground() {
  return (
    <div id="lux-bg" aria-hidden="true">
      <div className="lux-orb orb1" />
      <div className="lux-orb orb2" />
      <div className="lux-orb orb3" />
      <div className="lux-shimmer" />

      {/* Goldene Lichtwellen */}
      <div className="gold-rays">
        <svg viewBox="0 95 1440 110">
          <defs>
            <linearGradient
              id="rg"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="360"
              y2="0"
              spreadMethod="repeat"
            >
              <stop offset="0" stopColor="#e6962f" stopOpacity=".4" />
              <stop offset=".34" stopColor="#ffc163" />
              <stop offset=".5" stopColor="#fff3cf" />
              <stop offset=".66" stopColor="#ffb347" />
              <stop offset="1" stopColor="#e6962f" stopOpacity=".4" />
            </linearGradient>
            <path
              id="wv1"
              d="M-540,150 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0"
            />
            <path
              id="wv3"
              d="M-600,143 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0"
            />
            <path
              id="wv5"
              d="M-570,134 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0"
            />
          </defs>

          <g fill="none" stroke="url(#rg)" strokeLinecap="round">
            <use href="#wv1" strokeWidth="2.2">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="360 0"
                dur="9s"
                repeatCount="indefinite"
              />
            </use>
            <use href="#wv3" strokeWidth="1.8" opacity=".85">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="360 0"
                dur="13s"
                repeatCount="indefinite"
              />
            </use>
            <use href="#wv5" strokeWidth="1.5" opacity=".7">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="360 0"
                dur="17s"
                repeatCount="indefinite"
              />
            </use>
          </g>
        </svg>
      </div>
    </div>
  );
}

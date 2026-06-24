/** Dekorativer Sternenhimmel + goldene Lichtwellen für die Auth-Screens. */

const STARS = [
  { left: "8%", top: 30, s: 7, d: "0s" },
  { left: "19%", top: 72, s: 10, d: "1.2s" },
  { left: "6%", top: 122, s: 6, d: "2.4s" },
  { left: "33%", top: 18, s: 9, d: ".6s" },
  { left: "29%", top: 102, s: 6, d: "3s" },
  { left: "50%", top: -2, s: 8, d: "1.8s" },
  { left: "47%", top: 172, s: 7, d: "2.1s" },
  { left: "67%", top: 26, s: 11, d: ".3s" },
  { left: "63%", top: 106, s: 6, d: "2.7s" },
  { left: "80%", top: 58, s: 9, d: "1.5s" },
  { left: "90%", top: 114, s: 8, d: ".9s" },
  { left: "93%", top: 38, s: 7, d: "3.3s" },
  { left: "84%", top: 16, s: 12, d: "2s" },
];

const WAVES = [
  { id: "wv1", d: "M-540,150 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0 q90,-30 180,0 q90,30 180,0", dur: "8s", w: 2, wg: 4, o: 1 },
  { id: "wv2", d: "M-450,158 q90,24 180,0 q90,-24 180,0 q90,24 180,0 q90,-24 180,0 q90,24 180,0 q90,-24 180,0 q90,24 180,0 q90,-24 180,0 q90,24 180,0 q90,-24 180,0 q90,24 180,0 q90,-24 180,0", dur: "11s", w: 1.4, wg: 3.4, o: 0.85 },
  { id: "wv3", d: "M-600,143 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0 q90,-34 180,0 q90,34 180,0", dur: "6.5s", w: 1.7, wg: 3.7, o: 1 },
  { id: "wv4", d: "M-510,167 q90,20 180,0 q90,-20 180,0 q90,20 180,0 q90,-20 180,0 q90,20 180,0 q90,-20 180,0 q90,20 180,0 q90,-20 180,0 q90,20 180,0 q90,-20 180,0 q90,20 180,0 q90,-20 180,0", dur: "13s", w: 1.1, wg: 3.1, o: 0.7 },
  { id: "wv5", d: "M-570,134 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0 q90,-28 180,0 q90,28 180,0", dur: "9.5s", w: 1.3, wg: 3.3, o: 0.8 },
];

export default function AuthDecor() {
  return (
    <>
      <div className="lg-sky" aria-hidden="true">
        {STARS.map((st, i) => (
          <span
            key={i}
            className="lg-star"
            style={{ left: st.left, top: st.top, width: st.s, height: st.s, animationDelay: st.d }}
          />
        ))}
      </div>

      <div className="lg-rays" aria-hidden="true">
        <svg viewBox="0 0 760 240" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="rg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="360" y2="0" spreadMethod="repeat">
              <stop offset="0" stopColor="#e6962f" stopOpacity=".35" />
              <stop offset=".34" stopColor="#ffc163" stopOpacity=".85" />
              <stop offset=".5" stopColor="#fff3cf" />
              <stop offset=".66" stopColor="#ffb347" stopOpacity=".9" />
              <stop offset="1" stopColor="#e6962f" stopOpacity=".35" />
            </linearGradient>
            <filter id="gl" x="-10%" y="-120%" width="120%" height="340%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            {WAVES.map((w) => (
              <path key={w.id} id={w.id} d={w.d} />
            ))}
          </defs>
          <g filter="url(#gl)" fill="none" stroke="url(#rg)" strokeLinecap="round" opacity=".55">
            {WAVES.map((w) => (
              <use key={w.id} href={`#${w.id}`} strokeWidth={w.wg}>
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-360 0" dur={w.dur} repeatCount="indefinite" />
              </use>
            ))}
          </g>
          <g fill="none" stroke="url(#rg)" strokeLinecap="round">
            {WAVES.map((w) => (
              <use key={w.id} href={`#${w.id}`} strokeWidth={w.w} opacity={w.o}>
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-360 0" dur={w.dur} repeatCount="indefinite" />
              </use>
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}

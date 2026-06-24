/** Rendert ein Icon aus der SVG-Sprite (siehe IconSprite). */
export default function Icon({
  name,
  className = "i",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg className={className} style={style}>
      <use href={`#${name}`} />
    </svg>
  );
}

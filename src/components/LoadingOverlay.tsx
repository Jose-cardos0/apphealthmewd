/** Vollbild-Lade-Overlay mit goldener „Esfera" (Spinner). */
export default function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="spin-overlay">
      <div className="spin-ball" />
      <div className="spin-text">{text ?? "Wird gespeichert …"}</div>
    </div>
  );
}

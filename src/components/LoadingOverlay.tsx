"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Vollbild-Lade-Overlay mit goldener „Esfera" (Spinner). Per Portal über allem. */
export default function LoadingOverlay({ text }: { text?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="spin-overlay">
      <div className="spin-ball" />
      <div className="spin-text">{text ?? "Wird gespeichert …"}</div>
    </div>,
    document.body,
  );
}

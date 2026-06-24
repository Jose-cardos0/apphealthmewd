"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Vollbild-Lade-Overlay mit hüpfendem Flufy-Maskottchen. Per Portal über allem. */
export default function LoadingOverlay({ text, image }: { text?: string; image?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const label = (text ?? "Wird gespeichert").replace(/[\s.…]+$/u, "");

  return createPortal(
    <div className="spin-overlay">
      <div className="loader-mascot">
        <span className="loader-glow" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image ?? "/mascote/fluflyhappy.png"} alt="" />
      </div>
      <div className="spin-text">
        {label}
        <span className="loader-dots"><i /><i /><i /></span>
      </div>
    </div>,
    document.body,
  );
}

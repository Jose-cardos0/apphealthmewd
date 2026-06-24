"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "@/components/Modal";

export default function Alert({
  title,
  message,
  onClose,
  tone = "warn",
}: {
  title: string;
  message: string;
  onClose: () => void;
  tone?: "warn" | "info";
}) {
  const color = tone === "warn" ? "#e0484b" : "var(--accent2)";
  const bg = tone === "warn" ? "#fdecec" : "#f5f1e7";
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={20} />
        </span>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--ink)" }}>{message}</p>
      </div>
      <button className="qz-next" style={{ width: "100%", marginTop: 18 }} onClick={onClose}>Verstanden</button>
    </Modal>
  );
}

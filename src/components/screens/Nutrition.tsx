"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import type { Profile } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string };

const FLUFY_IMG = "/mascote/flufyfeliz.png";

export default function Nutrition({ active, profile }: { active: boolean; profile: Profile | null }) {
  const name = profile?.first_name || "";
  const meSrc = avatarSrc(profile);
  const meInit = avatarInitials(profile);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        `Hallo${name ? " " + name : ""}! Schön, dass du da bist. Ich bin Flufy, dein KI-Ernährungshelfer von HealthMe. ` +
        "Frag mich alles rund um Ernährung, Heißhunger, Eiweiß oder deinen Alltag mit GLP-1.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, busy, active]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text } as Msg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/grok/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler");
      setMessages((p) => [...p, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Entschuldige, ich konnte gerade nicht antworten. Bitte versuche es gleich noch einmal." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-nutrition">
      <div className="chathead">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FLUFY_IMG} alt="Flufy" style={{ objectPosition: "top", background: "#eaf3fb" }} />
        <div style={{ flex: 1 }}>
          <div className="nm">Flufy <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent2)", background: "#f4f1e9", padding: "2px 7px", borderRadius: 8, marginLeft: 4 }}>KI</span></div>
          <div className="st"><span className="dot" /> Online · dein KI-Ernährungshelfer</div>
        </div>
        <div style={{ color: "var(--accent2)" }}><Icon name="ic-chat" /></div>
      </div>

      <div className="scr-body chat" ref={chatRef}>
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="msg me">
              {meSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meSrc} alt="" />
              ) : (
                <span className="av">{meInit}</span>
              )}
              <div className="bub">{msg.content}</div>
            </div>
          ) : (
            <div key={i} className="msg them">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FLUFY_IMG} alt="Flufy" style={{ objectPosition: "top", background: "#eaf3fb" }} />
              <div className="bub">{msg.content}</div>
            </div>
          ),
        )}
        {busy && (
          <div className="msg them">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FLUFY_IMG} alt="Flufy" style={{ objectPosition: "top", background: "#eaf3fb" }} />
            <div className="bub" style={{ color: "var(--muted)" }}>schreibt …</div>
          </div>
        )}
      </div>

      <p className="note-disc">Flufy ist eine KI und antwortet auf Basis von Informationen aus dem Internet – das ist keine ärztliche Beratung. Bei Fragen oder Beschwerden wende dich bitte an eine Ärztin/einen Arzt oder eine qualifizierte Fachkraft.</p>
      <form className="chat-input" onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Schreibe eine Nachricht …" />
        <button type="submit" aria-label="Senden"><Icon name="ic-send" /></button>
      </form>
    </section>
  );
}

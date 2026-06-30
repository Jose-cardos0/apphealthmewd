"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string };

const FLUFY_IMG = "/mascote/fluflyhappy.png";

const TX = {
  de: {
    online: "Online",
    greeting: (name: string) =>
      `Hallo${name ? " " + name : ""}! Schön, dass du da bist. Ich bin Flufy, dein KI-Ernährungshelfer von HealthMe. ` +
      "Frag mich alles rund um Ernährung, Heißhunger, Eiweiß oder deinen Alltag mit GLP-1.",
    typing: "schreibt …",
    errorReply: "Entschuldige, ich konnte gerade nicht antworten. Bitte versuche es gleich noch einmal.",
    disclaimer:
      "Flufy ist eine KI und antwortet auf Basis von Informationen aus dem Internet – das ist keine ärztliche Beratung. Bei Fragen oder Beschwerden wende dich bitte an eine Ärztin/einen Arzt oder eine qualifizierte Fachkraft.",
    inputPh: "Schreibe eine Nachricht …",
    send: "Senden",
  },
  en: {
    online: "Online",
    greeting: (name: string) =>
      `Hi${name ? " " + name : ""}! Great to have you here. I'm Flufy, your AI nutrition helper from HealthMe. ` +
      "Ask me anything about nutrition, cravings, protein or your everyday life with GLP-1.",
    typing: "typing …",
    errorReply: "Sorry, I couldn't reply just now. Please try again in a moment.",
    disclaimer:
      "Flufy is an AI and answers based on information from the internet – this is not medical advice. If you have questions or concerns, please consult a doctor or a qualified professional.",
    inputPh: "Type a message …",
    send: "Send",
  },
} as const;

export default function Nutrition({ active, profile }: { active: boolean; profile: Profile | null }) {
  const { lang } = useI18n();
  const t = TX[lang];
  const name = profile?.first_name || "";
  const meSrc = avatarSrc(profile);
  const meInit = avatarInitials(profile);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: t.greeting(name),
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
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler");
      setMessages((p) => [...p, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: t.errorReply }]);
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
          <div className="nm">Flufy </div>
          <div className="st"><span className="dot" /> {t.online} </div>
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
            <div className="bub" style={{ color: "var(--muted)" }}>{t.typing}</div>
          </div>
        )}
      </div>

      <p className="note-disc">{t.disclaimer}</p>
      <form className="chat-input" onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.inputPh} />
        <button type="submit" aria-label={t.send}><Icon name="ic-send" /></button>
      </form>
    </section>
  );
}

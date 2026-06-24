"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import type { Profile } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string };

const DOC_IMG = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=faces";

export default function Nutrition({ active, profile }: { active: boolean; profile: Profile | null }) {
  const name = profile?.first_name || "";
  const meSrc = avatarSrc(profile);
  const meInit = avatarInitials(profile);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        `Hallo${name ? " " + name : ""}! Schön, dass du da bist. Ich bin Dr. Markus Feld, dein Ernährungsberater. ` +
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
        <img src={DOC_IMG} alt="" onError={(e) => ((e.target as HTMLImageElement).style.background = "#e6b325")} />
        <div style={{ flex: 1 }}>
          <div className="nm">Dr. Markus Feld</div>
          <div className="st"><span className="dot" /> Online · Ernährungsberater</div>
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
              <img src={DOC_IMG} alt="" onError={(e) => ((e.target as HTMLImageElement).style.background = "#e6b325")} />
              <div className="bub">{msg.content}</div>
            </div>
          ),
        )}
        {busy && (
          <div className="msg them">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DOC_IMG} alt="" onError={(e) => ((e.target as HTMLImageElement).style.background = "#e6b325")} />
            <div className="bub" style={{ color: "var(--muted)" }}>schreibt …</div>
          </div>
        )}
      </div>

      <p className="note-disc">Dr. Feld ersetzt keine ärztliche Beratung. Bei Beschwerden wende dich an eine Fachkraft.</p>
      <form className="chat-input" onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Schreibe eine Nachricht …" />
        <button type="submit" aria-label="Senden"><Icon name="ic-send" /></button>
      </form>
    </section>
  );
}

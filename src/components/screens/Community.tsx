"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const TX = {
  de: {
    title: "Community",
    subtitle: "Tausche dich live mit anderen aus.",
    online: (n: number) => `${n.toLocaleString("de-DE")} online`,
    defaultName: "Du",
    inputPh: "Schreib der Community …",
    send: "Senden",
    lines: [
      "Heute 8.000 Schritte geschafft – stolz auf mich!",
      "Woche 4 und schon 5 kg weniger. Es funktioniert wirklich.",
      "Tipp: Meal Prep am Sonntag spart unter der Woche so viel Zeit.",
      "Wer trinkt gerade auch seinen zweiten Liter Wasser?",
      "Diese Community ist Gold wert – danke für die Motivation!",
      "Heißhunger am Abend? Bei mir hilft ein Tee und früh ins Bett.",
      "Das Hähnchen-Brokkoli-Rezept ist mein neuer Favorit.",
      "Kleiner Reminder: Fortschritt ist nicht immer die Waage.",
    ],
  },
  en: {
    title: "Community",
    subtitle: "Connect live with others.",
    online: (n: number) => `${n.toLocaleString("en-US")} online`,
    defaultName: "You",
    inputPh: "Message the community …",
    send: "Send",
    lines: [
      "Hit 8,000 steps today – proud of myself!",
      "Week 4 and already 5 kg down. It really works.",
      "Tip: Meal prepping on Sunday saves so much time during the week.",
      "Who else is on their second liter of water right now?",
      "This community is priceless – thanks for the motivation!",
      "Cravings in the evening? A tea and an early night help me.",
      "The chicken-broccoli recipe is my new favorite.",
      "Little reminder: progress isn't always the scale.",
    ],
  },
} as const;

const PEOPLE = [
  { n: "Sophie", img: "1494790108377-be9c29b29330" },
  { n: "Lena", img: "1438761681033-6461ffad8d80" },
  { n: "Marie", img: "1534528741775-53994a69daeb" },
  { n: "Jana", img: "1544005313-94ddf0286df2" },
  { n: "Nina", img: "1517841905240-472988babdf9" },
  { n: "Clara", img: "1489424731084-a5d8b219a5bb" },
  { n: "Emma", img: "1531123897727-8f129e1688ce" },
];
const pImg = (img: string) => `https://images.unsplash.com/photo-${img}?w=100&h=100&fit=crop&crop=faces`;

type Row = { name: string; text: string; me?: boolean; img?: string };

export default function Community({ active, profile }: { active: boolean; profile: Profile | null }) {
  const { lang } = useI18n();
  const t = TX[lang];
  const myName = profile?.first_name || t.defaultName;
  const meSrc = avatarSrc(profile);
  const meInit = avatarInitials(profile);
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: 5 }, (_, k) => ({ name: PEOPLE[k % PEOPLE.length].n, img: PEOPLE[k % PEOPLE.length].img, text: t.lines[k] })),
  );
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(14808);
  const ci = useRef(5);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [rows]);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      const p = PEOPLE[Math.floor(Math.random() * PEOPLE.length)];
      setRows((r) => [...r, { name: p.n, img: p.img, text: t.lines[ci.current % t.lines.length] }]);
      ci.current += 1;
      setOnline(14750 + Math.floor(Math.random() * 120));
    }, 5000);
    return () => clearInterval(iv);
  }, [active, t]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setRows((r) => [...r, { name: myName, text: v, me: true }]);
    setInput("");
  }

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-community">
      <div className="scr-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="t">{t.title}</h1>
          <div className="muted" style={{ fontSize: 13 }}>{t.subtitle}</div>
        </div>
        <span className="conline"><span className="dot" /> {t.online(online)}</span>
      </div>

      <div className="scr-body chat" ref={chatRef}>
        {rows.map((r, i) =>
          r.me ? (
            <div key={i} className="msg me">
              {meSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meSrc} alt="" />
              ) : (
                <span className="av">{meInit}</span>
              )}
              <div><p className="who">{myName}</p><div className="bub">{r.text}</div></div>
            </div>
          ) : (
            <div key={i} className="msg them">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pImg(r.img!)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.background = "#e6b325")} />
              <div><p className="who">{r.name}</p><div className="bub">{r.text}</div></div>
            </div>
          ),
        )}
      </div>

      <form className="chat-input" onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.inputPh} />
        <button type="submit" aria-label={t.send}><Icon name="ic-send" /></button>
      </form>
    </section>
  );
}

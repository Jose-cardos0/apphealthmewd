"use client";

import { useEffect, useRef, useState } from "react";
import { SendIcon } from "@/components/Icons";

type Msg = { name: string; text: string; isUser: boolean };

const MEMBERS: { name: string; color: string }[] = [
  { name: "Lena", color: "bg-rose-100 text-rose-500" },
  { name: "Markus", color: "bg-blue-100 text-blue-500" },
  { name: "Sophie", color: "bg-purple-100 text-purple-500" },
  { name: "Jonas", color: "bg-emerald-100 text-emerald-500" },
  { name: "Mia", color: "bg-amber-100 text-amber-600" },
  { name: "Tom", color: "bg-cyan-100 text-cyan-600" },
];

const LINES = [
  "Heute schon 10.000 Schritte geschafft! 🚶‍♀️",
  "Das Lachs-Bowl Rezept aus der App ist der Hammer 😍",
  "Wer hat Tipps gegen Heißhunger am Abend?",
  "Woche 3 und ich fühle mich schon viel fitter 💪",
  "Ich liebe diese Community – ihr motiviert mich jeden Tag 💛",
  "Endlich mal Frühstück vorbereitet: Overnight Oats!",
  "Kleiner Reminder: Trinkt genug Wasser heute 💧",
  "2 kg in diesem Monat – ich bin so stolz 🎉",
  "Welche Rezepte macht ihr am Wochenende?",
  "Motivationstief heute … aber ihr gebt mir Kraft, danke!",
];

const REACTIONS = [
  "Stark! 💪",
  "Das motiviert mich auch 🙌",
  "Super, weiter so! 🎉",
  "Sehe ich genauso 😊",
  "Danke fürs Teilen 💛",
  "Mega! 🔥",
];

const STORAGE_KEY = "healthme_community_chat";

const SEED: Msg[] = [
  { name: "Lena", text: "Guten Morgen zusammen! ☀️ Auf einen gesunden Tag!", isUser: false },
  { name: "Markus", text: "Moin! Heute steht ein Ganzkörper-Workout an 💪", isUser: false },
  { name: "Sophie", text: "Die App hat mir gerade ein mega Rezept gezaubert 🤤", isUser: false },
];

function memberColor(name: string) {
  return MEMBERS.find((m) => m.name === name)?.color || "bg-gold-100 text-gold-600";
}

export default function CommunityTab({ active }: { active: boolean }) {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(1482);
  const chatRef = useRef<HTMLDivElement>(null);
  const botIndex = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignoriert */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* ignoriert */
    }
  }, [messages]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // Live-Simulation nur, wenn die Community-Ansicht aktiv ist
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      const member = MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
      const text = LINES[botIndex.current % LINES.length];
      botIndex.current += 1;
      setMessages((prev) => [...prev, { name: member.name, text, isUser: false }]);
      setOnline(1450 + Math.floor(Math.random() * 90));
    }, 14000);
    return () => clearInterval(timer);
  }, [active]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { name: "Du", text, isUser: true }]);
    setInput("");
    setTimeout(() => {
      const member = MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
      const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      setMessages((prev) => [...prev, { name: member.name, text: r, isUser: false }]);
    }, 2500 + Math.random() * 2000);
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            HealthMe Community 💬
          </h1>
          <p className="text-gray-600">Tausche dich live mit anderen Mitgliedern aus.</p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full whitespace-nowrap">
          <span className="w-2 h-2 bg-green-400 rounded-full" /> {online} online
        </span>
      </div>

      <div
        className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
        style={{ height: "62vh", minHeight: 440 }}
      >
        <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gold-50/30">
          {messages.map((m, i) =>
            m.isUser ? (
              <div key={i} className="flex gap-3 justify-end">
                <div className="text-right max-w-[82%]">
                  <p className="text-xs text-gray-400 mb-0.5">Du</p>
                  <div className="bg-gold-400 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-md shadow-sm inline-block break-words">
                    {m.text}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gold-200 flex items-center justify-center text-sm flex-shrink-0">
                  🙋
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${memberColor(
                    m.name,
                  )} flex items-center justify-center text-sm font-bold flex-shrink-0`}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="max-w-[82%]">
                  <p className="text-xs text-gray-400 mb-0.5">{m.name}</p>
                  <div className="bg-white text-gray-700 text-sm px-4 py-2.5 rounded-2xl rounded-tl-md shadow-sm border border-gold-100 inline-block break-words">
                    {m.text}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        <form onSubmit={send} className="border-t border-gold-100 p-3 flex items-center gap-2 bg-white">
          <input
            type="text"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreib der Community ..."
            className="flex-1 border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
          <button
            type="submit"
            className="bg-gold-400 hover:bg-gold-500 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition"
            title="Senden"
          >
            <SendIcon />
          </button>
        </form>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center max-w-xl mx-auto">
        Bitte sei respektvoll und teile keine sensiblen Daten. Beiträge, die gegen unsere Richtlinien
        verstoßen, können entfernt werden.
      </p>
    </div>
  );
}

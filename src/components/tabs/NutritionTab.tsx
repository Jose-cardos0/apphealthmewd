"use client";

import { useEffect, useRef, useState } from "react";
import { SendIcon } from "@/components/Icons";
import type { ChatMessage } from "@/lib/grok";

const STORAGE_KEY = "healthme_nutrition_chat";
const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hallo! 🥑 Ich bin deine HealthMe Ernährungsberaterin und für dich da – Tag und Nacht. " +
    "Frag mich alles rund um Ernährung, Kalorien, Lebensmittel oder deinen Diätplan. 💛",
};

export default function NutritionTab({ active }: { active: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Verlauf laden
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignoriert */
    }
  }, []);

  // Verlauf speichern
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      /* ignoriert */
    }
  }, [messages]);

  // Nach unten scrollen
  useEffect(() => {
    if (active && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, busy, active]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: "user", content: text } as ChatMessage];
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
      if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Entschuldige, ich konnte gerade nicht antworten. Bitte versuche es gleich noch einmal. (" +
            msg +
            ")",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">HealthMe Nutrition 🥑</h1>
        <p className="text-gray-600">
          Deine KI-Ernährungsberaterin – frag mich alles rund um Ernährung, Tag und Nacht.
        </p>
      </div>

      <div
        className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
        style={{ height: "62vh", minHeight: 440 }}
      >
        <div className="bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
            🥑
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">HealthMe Nutrition</p>
            <p className="text-gold-50 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full inline-block" /> Online · antwortet sofort
            </p>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gold-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  m.role === "user"
                    ? "bg-gold-400 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-[82%] shadow-sm whitespace-pre-wrap"
                    : "bg-white text-gray-700 text-sm px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[85%] shadow-sm border border-gold-100 whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-400 text-sm px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm border border-gold-100">
                schreibt …
              </div>
            </div>
          )}
        </div>

        <form onSubmit={send} className="border-t border-gold-100 p-3 flex items-center gap-2 bg-white">
          <input
            type="text"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreib deine Frage ..."
            className="flex-1 border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-gold-400 hover:bg-gold-500 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition disabled:opacity-70"
            title="Senden"
          >
            <SendIcon />
          </button>
        </form>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center max-w-xl mx-auto">
        HealthMe Nutrition ersetzt keine ärztliche oder ernährungsmedizinische Beratung. Bei
        gesundheitlichen Beschwerden wende dich bitte an eine qualifizierte Fachkraft.
      </p>
    </div>
  );
}

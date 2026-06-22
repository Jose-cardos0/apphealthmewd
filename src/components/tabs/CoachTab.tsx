"use client";

import { useEffect, useState } from "react";
import { DumbbellIcon, TrashIcon, Spinner } from "@/components/Icons";
import { addSaved, listSaved, removeSaved } from "@/lib/saved";
import type { SavedItem, Workout } from "@/lib/types";

const GOALS = [
  "Abnehmen & Fettverbrennung",
  "Muskeln aufbauen",
  "Fit & beweglich werden",
  "Ganzkörper straffen",
  "Ausdauer verbessern",
];
const LEVELS = ["Anfänger", "Fortgeschritten", "Profi"];
const TIMES = ["15 Minuten", "20 Minuten", "30 Minuten", "45 Minuten"];
const FOCI = ["Ganzkörper", "Bauch & Core", "Beine & Po", "Oberkörper & Arme", "Rücken & Haltung"];

export default function CoachTab() {
  const [goal, setGoal] = useState(GOALS[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [time, setTime] = useState(TIMES[1]);
  const [focus, setFocus] = useState(FOCI[0]);

  const [result, setResult] = useState<Workout | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [list, setList] = useState<SavedItem<Workout>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSaved<Workout>("workout").then(setList).catch(() => {});
  }, []);

  async function generate() {
    setError(null);
    setResult(null);
    setSavedId(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grok/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, level, time, focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
      setResult({
        titel: data.titel || "Dein Trainingsplan",
        meta: data.meta || "",
        aufwaermen: Array.isArray(data.aufwaermen) ? data.aufwaermen : [],
        uebungen: Array.isArray(data.uebungen) ? data.uebungen : [],
        tipps: Array.isArray(data.tipps) ? data.tipps : [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError("Der Coach konnte gerade keinen Plan erstellen. Bitte versuche es erneut. (" + msg + ")");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave() {
    if (!result) return;
    try {
      if (savedId) {
        await removeSaved(savedId);
        setList((p) => p.filter((x) => x.id !== savedId));
        setSavedId(null);
      } else {
        const row = await addSaved<Workout>("workout", result);
        setList((p) => [row, ...p]);
        setSavedId(row.id);
      }
    } catch {
      /* ignoriert */
    }
  }

  async function remove(id: string) {
    await removeSaved(id);
    setList((p) => p.filter((x) => x.id !== id));
    if (savedId === id) setSavedId(null);
  }

  function view(item: SavedItem<Workout>) {
    setResult(item.data);
    setSavedId(item.id);
    setError(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">HealthMe Coach 💪</h1>
        <p className="text-gray-600">
          Erstelle deinen persönlichen Trainingsplan für zu Hause – ganz ohne Geräte.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Dein Ziel" value={goal} onChange={setGoal} options={GOALS} />
          <Select label="Dein Level" value={level} onChange={setLevel} options={LEVELS} />
          <Select label="Zeit pro Einheit" value={time} onChange={setTime} options={TIMES} />
          <Select label="Fokus" value={focus} onChange={setFocus} options={FOCI} />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="mt-5 w-full bg-gold-400 hover:bg-gold-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-gold-200 transition flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {loading ? (
            <>
              <Spinner /> Dein Plan wird erstellt ...
            </>
          ) : (
            <>
              <DumbbellIcon className="w-5 h-5" /> Trainingsplan erstellen
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-8 bg-white border border-gold-200 rounded-3xl shadow-sm p-6 text-center">
          <p className="text-gold-500 font-semibold mb-1">Hoppla! 💪</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{result.titel}</h2>
              <p className="text-gold-50 text-xs mt-0.5">{result.meta}</p>
            </div>
            <button
              onClick={toggleSave}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
            >
              {savedId ? "✓ Gespeichert" : "♡ Speichern"}
            </button>
          </div>
          <div className="p-6 md:p-8">
            {result.aufwaermen.length > 0 && (
              <>
                <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2">
                  Aufwärmen
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {result.aufwaermen.map((a, i) => (
                    <span
                      key={i}
                      className="bg-gold-100 text-gold-600 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2">Workout</p>
            {result.uebungen.map((u, i) => (
              <div key={i} className="flex items-start gap-3 bg-gold-50 rounded-xl px-4 py-3 mb-2">
                <span className="w-7 h-7 bg-white text-gold-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                    <span className="text-xs text-gold-500 font-bold whitespace-nowrap">{u.saetze}</span>
                  </div>
                  {u.hinweis && <p className="text-xs text-gray-500 mt-0.5">{u.hinweis}</p>}
                </div>
              </div>
            ))}

            {result.tipps.length > 0 && (
              <div className="mt-5 bg-white border border-gold-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2">Tipps</p>
                <ul className="space-y-1.5">
                  {result.tipps.map((t, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-gold-400">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-gray-400 mt-5">
              Bei gesundheitlichen Einschränkungen, Schmerzen oder Vorerkrankungen halte vor dem
              Training bitte Rücksprache mit einer Ärztin oder einem Arzt.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-extrabold text-gray-800 mb-4">Gespeicherte Trainingspläne 🗂️</h3>
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto bg-gold-100 text-gold-500 rounded-2xl flex items-center justify-center mb-4">
              <DumbbellIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Noch keine Pläne gespeichert</h3>
            <p className="text-sm text-gray-500">
              Erstelle einen Trainingsplan und tippe auf{" "}
              <span className="font-semibold text-gold-500">„Speichern“</span>, um ihn hier zu sammeln.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {list.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-4">
                  <h3 className="font-bold text-white">{item.data.titel}</h3>
                  <p className="text-gold-50 text-xs mt-0.5">{item.data.meta}</p>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-500 mb-4">{item.data.uebungen.length} Übungen</p>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => view(item)}
                      className="flex-1 bg-gold-400 hover:bg-gold-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                    >
                      Ansehen
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      title="Löschen"
                      className="w-11 border border-gold-200 text-gold-500 hover:bg-gold-50 rounded-xl flex items-center justify-center transition"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gold-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

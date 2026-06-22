"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, TrashIcon, Spinner } from "@/components/Icons";
import { addSaved, listSaved, removeSaved } from "@/lib/saved";
import type { Plan, SavedItem } from "@/lib/types";

const GOALS = ["Abnehmen", "Gewicht halten", "Muskeln aufbauen"];
const KCALS = ["1400 kcal", "1600 kcal", "1800 kcal", "2000 kcal", "2200 kcal"];
const MEALS = ["3 Mahlzeiten", "4 Mahlzeiten", "5 Mahlzeiten"];
const DIETS = ["Alles essen", "Vegetarisch", "Vegan", "Low Carb", "Eiweißreich"];

export default function PlannerTab() {
  const [goal, setGoal] = useState(GOALS[0]);
  const [kcal, setKcal] = useState(KCALS[1]);
  const [meals, setMeals] = useState(MEALS[1]);
  const [diet, setDiet] = useState(DIETS[0]);

  const [result, setResult] = useState<Plan | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [list, setList] = useState<SavedItem<Plan>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSaved<Plan>("plan").then(setList).catch(() => {});
  }, []);

  async function generate() {
    setError(null);
    setResult(null);
    setSavedId(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grok/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, kcal, meals, diet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
      setResult({
        titel: data.titel || "Dein Wochenplan",
        meta: data.meta || "",
        tage: Array.isArray(data.tage) ? data.tage : [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError("Der Plan konnte gerade nicht erstellt werden. Bitte versuche es erneut. (" + msg + ")");
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
        const row = await addSaved<Plan>("plan", result);
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

  function view(item: SavedItem<Plan>) {
    setResult(item.data);
    setSavedId(item.id);
    setError(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">HealthMe Planner 📅</h1>
        <p className="text-gray-600">
          Erstelle deinen kompletten 7-Tage-Ernährungsplan auf Knopfdruck.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Dein Ziel" value={goal} onChange={setGoal} options={GOALS} />
          <Select label="Kalorien pro Tag" value={kcal} onChange={setKcal} options={KCALS} />
          <Select label="Mahlzeiten pro Tag" value={meals} onChange={setMeals} options={MEALS} />
          <Select label="Ernährungsform" value={diet} onChange={setDiet} options={DIETS} />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="mt-5 w-full bg-gold-400 hover:bg-gold-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-gold-200 transition flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {loading ? (
            <>
              <Spinner /> Dein Wochenplan wird erstellt ...
            </>
          ) : (
            <>
              <CalendarIcon className="w-5 h-5" /> Wochenplan erstellen
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-8 bg-white border border-gold-200 rounded-3xl shadow-sm p-6 text-center">
          <p className="text-gold-500 font-semibold mb-1">Hoppla! 📅</p>
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
            <div className="space-y-3">
              {result.tage.map((d, i) => (
                <div key={i} className="bg-gold-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">
                    {d.tag}
                  </p>
                  {d.mahlzeiten.map((m, j) => (
                    <span key={j} className="block text-sm text-gray-700 mt-0.5">
                      <span className="font-semibold text-gold-500">{m.name}:</span> {m.gericht}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-5">
              Die Pläne sind KI-gestützte Vorschläge. Bei Allergien, Erkrankungen oder besonderen
              Bedürfnissen halte bitte Rücksprache mit einer Fachkraft.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-extrabold text-gray-800 mb-4">Gespeicherte Wochenpläne 🗂️</h3>
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto bg-gold-100 text-gold-500 rounded-2xl flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Noch keine Pläne gespeichert</h3>
            <p className="text-sm text-gray-500">
              Erstelle einen Wochenplan und tippe auf{" "}
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
                  <p className="text-xs text-gray-500 mb-4">{item.data.tage.length} Tage geplant</p>
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

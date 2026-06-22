"use client";

import { useEffect, useState } from "react";
import { CameraIcon, Spinner } from "@/components/Icons";
import { addSaved, listSaved, removeSaved } from "@/lib/saved";
import type { SavedItem, Scan } from "@/lib/types";

export default function ScanTab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Scan | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [list, setList] = useState<SavedItem<Scan>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSaved<Scan>("scan").then(setList).catch(() => {});
  }, []);

  async function analyze() {
    const t = text.trim();
    if (!t) return;
    setError(null);
    setResult(null);
    setSavedId(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grok/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
      setResult({
        gericht: data.gericht || "Deine Mahlzeit",
        portion: data.portion || "",
        kcal: data.kcal || "–",
        eiweiss: data.eiweiss || "–",
        kohlenhydrate: data.kohlenhydrate || "–",
        fett: data.fett || "–",
        hinweis: data.hinweis || "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError("Die Analyse hat gerade nicht geklappt. Bitte versuche es erneut. (" + msg + ")");
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
        const row = await addSaved<Scan>("scan", result);
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">HealthMe Scan 📷</h1>
        <p className="text-gray-600">Gib deine Mahlzeit ein und erhalte sofort Kalorien & Nährwerte.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Deine Mahlzeit</label>
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="z. B. Hähnchenbrust mit Reis und Brokkoli, 1 Portion"
          className="w-full border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="mt-4 w-full bg-gold-400 hover:bg-gold-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-gold-200 transition flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {loading ? (
            <>
              <Spinner /> Wird analysiert ...
            </>
          ) : (
            <>
              <CameraIcon className="w-5 h-5" /> Mahlzeit analysieren
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-8 bg-white border border-gold-200 rounded-3xl shadow-sm p-6 text-center">
          <p className="text-gold-500 font-semibold mb-1">Hoppla! 📷</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{result.gericht}</h2>
              <p className="text-gold-50 text-xs mt-0.5">{result.portion}</p>
            </div>
            <button
              onClick={toggleSave}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
            >
              {savedId ? "✓ Gespeichert" : "♡ Speichern"}
            </button>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-4 gap-2 text-center">
              <Cell value={result.kcal} label="kcal" />
              <Cell value={result.eiweiss} label="Eiweiß" />
              <Cell value={result.kohlenhydrate} label="Kohlenh." />
              <Cell value={result.fett} label="Fett" />
            </div>
            {result.hinweis && (
              <div className="mt-5 bg-gold-50 border border-gold-100 rounded-2xl p-4 text-sm text-gray-600">
                💡 {result.hinweis}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-5">
              Die Nährwertangaben sind KI-gestützte Schätzwerte und können je nach Zubereitung und
              Menge abweichen.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-extrabold text-gray-800 mb-4">Gespeicherte Analysen 🗂️</h3>
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto bg-gold-100 text-gold-500 rounded-2xl flex items-center justify-center mb-4">
              <CameraIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Noch keine Analysen gespeichert</h3>
            <p className="text-sm text-gray-500">
              Analysiere eine Mahlzeit und tippe auf{" "}
              <span className="font-semibold text-gold-500">„Speichern“</span>, um sie hier zu sammeln.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {list.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl shadow-sm p-5 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-1">{item.data.gericht}</h3>
                <p className="text-xs text-gray-500 mb-3">{item.data.portion}</p>
                <div className="grid grid-cols-4 gap-1.5 text-center mb-4">
                  <MiniCell value={item.data.kcal} label="kcal" />
                  <MiniCell value={item.data.eiweiss} label="Eiw." />
                  <MiniCell value={item.data.kohlenhydrate} label="KH" />
                  <MiniCell value={item.data.fett} label="Fett" />
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="mt-auto w-full border border-gold-200 text-gold-500 hover:bg-gold-50 text-sm font-semibold py-2 rounded-xl transition"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-gold-50 rounded-xl py-3">
      <p className="font-extrabold text-gold-500">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function MiniCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-gold-50 rounded-lg py-2">
      <p className="font-bold text-gold-500 text-sm">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

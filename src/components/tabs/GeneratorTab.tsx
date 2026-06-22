"use client";

import { useState } from "react";
import { SparkIcon, HeartIcon, Spinner } from "@/components/Icons";
import { bildFuer } from "@/lib/foodImages";
import type { Recipe, SavedItem } from "@/lib/types";

type Props = {
  recipes: SavedItem<Recipe>[];
  viewedRecipe: { id: string | null; recipe: Recipe } | null;
  setViewedRecipe: (v: { id: string | null; recipe: Recipe } | null) => void;
  onSave: (recipe: Recipe) => Promise<SavedItem<Recipe>>;
  onDelete: (id: string) => Promise<void>;
};

type RecipeResponse = {
  titel?: string;
  meta?: string;
  schritte?: string[];
  naehrwerte?: Recipe["naehrwerte"];
  error?: string;
};

export default function GeneratorTab({
  viewedRecipe,
  setViewedRecipe,
  onSave,
  onDelete,
}: Props) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const recipe = viewedRecipe?.recipe ?? null;
  const savedId = viewedRecipe?.id ?? null;

  async function generate() {
    const raw = ingredients.trim();
    const list = raw
      ? raw.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean)
      : ["Mehl", "Wasser", "Hefe", "Salz"];

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grok/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: list }),
      });
      const data: RecipeResponse = await res.json();
      if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);

      const recipe: Recipe = {
        titel: data.titel || "Dein Rezept",
        meta: data.meta || "",
        zutaten: list,
        schritte: Array.isArray(data.schritte) ? data.schritte : [],
        naehrwerte: data.naehrwerte || {},
        bild: bildFuer((data.titel || "") + list.join(" ")),
      };
      setViewedRecipe({ id: null, recipe });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(
        "Die Fee konnte gerade kein Rezept zaubern. Bitte versuche es erneut. (" + msg + ")",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave() {
    if (!recipe) return;
    setSaving(true);
    try {
      if (savedId) {
        await onDelete(savedId);
        setViewedRecipe({ id: null, recipe });
      } else {
        const row = await onSave(recipe);
        setViewedRecipe({ id: row.id, recipe });
      }
    } catch {
      /* ignoriert */
    } finally {
      setSaving(false);
    }
  }

  const n = recipe?.naehrwerte || {};

  return (
    <div>
      {/* Begrüßung */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Hallo! 🧚‍♀️</h1>
        <p className="text-gray-600">
          Was hast du heute zu Hause? Gib deine Zutaten ein und ich zaubere dir ein Rezept.
        </p>
      </div>

      {/* Eingabe */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Deine Zutaten</label>
        <textarea
          rows={3}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="z. B. Mehl, Wasser, Hefe, Salz, Eier ..."
          className="w-full border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 w-full bg-gold-400 hover:bg-gold-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-gold-200 transition flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner /> Deine Fee zaubert dein Rezept ...
            </>
          ) : (
            <>
              <SparkIcon className="w-5 h-5" /> Rezept zaubern
            </>
          )}
        </button>
      </div>

      {/* Fehlermeldung */}
      {error && (
        <div className="mt-8 bg-white border border-gold-200 rounded-3xl shadow-sm p-6 text-center">
          <p className="text-gold-500 font-semibold mb-1">Hoppla! 🧚‍♀️</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}

      {/* Ergebnis */}
      {recipe && (
        <div className="mt-8 bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.bild} alt={recipe.titel} className="w-full h-52 object-cover" />
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="inline-block bg-gold-100 text-gold-500 text-xs font-semibold px-3 py-1 rounded-full">
                Dein Rezept ✨
              </span>
              <button
                onClick={toggleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition ${
                  savedId
                    ? "bg-gold-100 border-gold-300 text-gold-500"
                    : "border-gold-200 text-gray-400 hover:border-gold-400"
                }`}
              >
                <HeartIcon className="w-5 h-5" filled={!!savedId} />
                <span className="text-sm font-semibold">{savedId ? "Gespeichert" : "Speichern"}</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-1">{recipe.titel}</h2>
            <p className="text-gray-500 text-sm mb-6">{recipe.meta}</p>

            {/* Deine Zutaten */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-gold-400">●</span> Deine Zutaten
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.zutaten.map((z, i) => (
                  <span
                    key={i}
                    className="bg-gold-100 text-gold-500 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {z}
                  </span>
                ))}
              </div>
            </div>

            {/* Zubereitung */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-gold-400">●</span> So gelingt&apos;s – Schritt für Schritt
              </h3>
              <ol className="space-y-3 text-sm text-gray-600">
                {recipe.schritte.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gold-100 text-gold-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Nährwerte */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-gold-400">●</span> Nährwerte{" "}
                <span className="text-xs font-normal text-gray-400">(pro Portion)</span>
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <Nutri value={n.kcal} label="kcal" />
                <Nutri value={n.eiweiss} label="Eiweiß" />
                <Nutri value={n.kohlenhydrate} label="Kohlenh." />
                <Nutri value={n.fett} label="Fett" />
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
                Die Nährwertangaben sind Durchschnittswerte und können je nach Zutaten leicht variieren.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Nutri({ value, label }: { value?: string; label: string }) {
  return (
    <div className="bg-gold-50 rounded-xl py-3">
      <p className="font-extrabold text-gold-500">{value || "–"}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

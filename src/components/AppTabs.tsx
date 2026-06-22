"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SparkIcon,
  HeartIcon,
  ChatIcon,
  UsersIcon,
  DumbbellIcon,
  CameraIcon,
  CalendarIcon,
} from "@/components/Icons";
import GeneratorTab from "@/components/tabs/GeneratorTab";
import LibraryTab from "@/components/tabs/LibraryTab";
import NutritionTab from "@/components/tabs/NutritionTab";
import CommunityTab from "@/components/tabs/CommunityTab";
import CoachTab from "@/components/tabs/CoachTab";
import ScanTab from "@/components/tabs/ScanTab";
import PlannerTab from "@/components/tabs/PlannerTab";
import { addSaved, listSaved, removeSaved } from "@/lib/saved";
import type { Recipe, SavedItem } from "@/lib/types";

type TabKey =
  | "generator"
  | "library"
  | "nutrition"
  | "community"
  | "coach"
  | "scan"
  | "planner";

export default function AppTabs() {
  const [tab, setTab] = useState<TabKey>("generator");

  // Gespeicherte Rezepte (zentral, da Generator & Bibliothek sie teilen)
  const [recipes, setRecipes] = useState<SavedItem<Recipe>[]>([]);
  // Aktuell im Generator angezeigtes Rezept (frisch erzeugt oder aus Bibliothek).
  // id ist die Supabase-Zeilen-ID, falls bereits gespeichert, sonst null.
  const [viewedRecipe, setViewedRecipe] = useState<{
    id: string | null;
    recipe: Recipe;
  } | null>(null);

  const reloadRecipes = useCallback(async () => {
    try {
      setRecipes(await listSaved<Recipe>("recipe"));
    } catch {
      /* ignoriert – z. B. offline */
    }
  }, []);

  useEffect(() => {
    reloadRecipes();
  }, [reloadRecipes]);

  const saveRecipe = useCallback(
    async (recipe: Recipe) => {
      const row = await addSaved<Recipe>("recipe", recipe);
      setRecipes((prev) => [row, ...prev]);
      return row;
    },
    [],
  );

  const deleteRecipe = useCallback(async (id: string) => {
    await removeSaved(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const viewRecipe = useCallback((item: SavedItem<Recipe>) => {
    setViewedRecipe({ id: item.id, recipe: item.data });
    setTab("generator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "generator", label: "Rezept", icon: <SparkIcon /> },
    { key: "library", label: "Rezepte", icon: <HeartIcon />, badge: recipes.length },
    { key: "nutrition", label: "Nutrition", icon: <ChatIcon /> },
    { key: "community", label: "Community", icon: <UsersIcon /> },
    { key: "coach", label: "Coach", icon: <DumbbellIcon /> },
    { key: "scan", label: "Scan", icon: <CameraIcon /> },
    { key: "planner", label: "Planner", icon: <CalendarIcon /> },
  ];

  return (
    <>
      {/* Tab-Navigation */}
      <div className="flex gap-2 mb-8 bg-white/70 backdrop-blur p-1.5 rounded-2xl shadow-sm overflow-x-auto">
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl transition whitespace-nowrap ${
                active ? "bg-gold-400 text-white shadow" : "text-gray-500 hover:text-gold-500"
              }`}
            >
              {t.icon}
              {t.label}
              {t.key === "library" && t.badge ? (
                <span className="ml-0.5 bg-gold-100 text-gold-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Inhalte – alle gemountet, inaktive ausgeblendet (behält Chat-/Listen-Zustand) */}
      <div className={tab === "generator" ? "" : "hidden"}>
        <GeneratorTab
          recipes={recipes}
          viewedRecipe={viewedRecipe}
          setViewedRecipe={setViewedRecipe}
          onSave={saveRecipe}
          onDelete={deleteRecipe}
        />
      </div>
      <div className={tab === "library" ? "" : "hidden"}>
        <LibraryTab recipes={recipes} onView={viewRecipe} onDelete={deleteRecipe} />
      </div>
      <div className={tab === "nutrition" ? "" : "hidden"}>
        <NutritionTab active={tab === "nutrition"} />
      </div>
      <div className={tab === "community" ? "" : "hidden"}>
        <CommunityTab active={tab === "community"} />
      </div>
      <div className={tab === "coach" ? "" : "hidden"}>
        <CoachTab />
      </div>
      <div className={tab === "scan" ? "" : "hidden"}>
        <ScanTab />
      </div>
      <div className={tab === "planner" ? "" : "hidden"}>
        <PlannerTab />
      </div>
    </>
  );
}

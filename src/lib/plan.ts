import { callGrokJson } from "@/lib/grok";
import type { OnboardingData, GrokPlan } from "@/lib/types";

export type { GrokPlan };

const SYSTEM_PROMPT_DE =
  "Du bist ein deutscher Ernährungs- und Gesundheitscoach der App HealthMe GLP-1. " +
  "Du erstellst auf Basis der Nutzerdaten realistische, sichere Tagesrichtwerte für eine " +
  "Person, die mit einer GLP-1-Therapie abnehmen möchte (moderates Kaloriendefizit, " +
  "hoher Eiweißanteil zum Muskelerhalt). " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"daily_kcal": 1700, "water_liters": 2.5, "protein_g": 120, "carbs_g": 150, "fat_g": 55, ' +
  '"motivation": "kurzer, motivierender Satz auf Deutsch", ' +
  '"tips": ["kurzer Tipp 1", "kurzer Tipp 2", "kurzer Tipp 3"]}. ' +
  "Alle Texte auf Deutsch. daily_kcal als ganze Zahl, water_liters mit einer Nachkommastelle. " +
  "Die Werte müssen zum Profil (Alter, Geschlecht, Größe, Gewicht, Zielgewicht, Aktivität) passen.";

const SYSTEM_PROMPT_EN =
  "You are a nutrition and health coach of the HealthMe GLP-1 app. " +
  "Based on the user data you create realistic, safe daily targets for a person who wants to " +
  "lose weight with a GLP-1 therapy (moderate calorie deficit, high protein share to preserve muscle). " +
  "Reply EXCLUSIVELY with valid JSON, no markdown, in the following format: " +
  '{"daily_kcal": 1700, "water_liters": 2.5, "protein_g": 120, "carbs_g": 150, "fat_g": 55, ' +
  '"motivation": "short, motivating sentence in English", ' +
  '"tips": ["short tip 1", "short tip 2", "short tip 3"]}. ' +
  "All text in English. daily_kcal as a whole number, water_liters with one decimal place. " +
  "The values must fit the profile (age, gender, height, weight, goal weight, activity).";

export async function generatePlan(d: Partial<OnboardingData> & { lang?: string }): Promise<GrokPlan> {
  const isEn = d.lang === "en";
  const userPrompt = isEn
    ? `Profile: gender ${d.gender || "?"}, age ${d.age || "?"}, ` +
      `height ${d.height_cm || "?"} cm, current weight ${d.start_weight_kg || "?"} kg, ` +
      `goal weight ${d.goal_weight_kg || "?"} kg, activity ${d.activity_level || "?"}, ` +
      `GLP-1 medication ${d.glp1_medication || "none"} (${d.glp1_dose || "-"}, ${d.glp1_frequency || "-"}).`
    : `Profil: Geschlecht ${d.gender || "?"}, Alter ${d.age || "?"}, ` +
      `Größe ${d.height_cm || "?"} cm, aktuelles Gewicht ${d.start_weight_kg || "?"} kg, ` +
      `Zielgewicht ${d.goal_weight_kg || "?"} kg, Aktivität ${d.activity_level || "?"}, ` +
      `GLP-1 Medikament ${d.glp1_medication || "keins"} (${d.glp1_dose || "-"}, ${d.glp1_frequency || "-"}).`;

  const plan = await callGrokJson<GrokPlan>({
    temperature: 0.4,
    messages: [
      { role: "system", content: isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_DE },
      { role: "user", content: userPrompt },
    ],
  });

  // Sicherheits-Clamps, falls die KI unrealistische Werte liefert
  return {
    daily_kcal: clamp(Math.round(plan.daily_kcal), 1000, 3500),
    water_liters: clamp(Number(plan.water_liters), 1.5, 4),
    protein_g: clamp(Math.round(plan.protein_g), 40, 250),
    carbs_g: clamp(Math.round(plan.carbs_g), 40, 400),
    fat_g: clamp(Math.round(plan.fat_g), 20, 160),
    motivation: String(plan.motivation || "").slice(0, 200),
    tips: Array.isArray(plan.tips) ? plan.tips.slice(0, 4).map((t) => String(t).slice(0, 160)) : [],
    lang: isEn ? "en" : "de",
  };
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

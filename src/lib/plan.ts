import { callGrokJson } from "@/lib/grok";
import type { OnboardingData, GrokPlan } from "@/lib/types";

export type { GrokPlan };

const SYSTEM_PROMPT =
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

export async function generatePlan(d: Partial<OnboardingData>): Promise<GrokPlan> {
  const userPrompt =
    `Profil: Geschlecht ${d.gender || "?"}, Alter ${d.age || "?"}, ` +
    `Größe ${d.height_cm || "?"} cm, aktuelles Gewicht ${d.start_weight_kg || "?"} kg, ` +
    `Zielgewicht ${d.goal_weight_kg || "?"} kg, Aktivität ${d.activity_level || "?"}, ` +
    `GLP-1 Medikament ${d.glp1_medication || "keins"} (${d.glp1_dose || "-"}, ${d.glp1_frequency || "-"}).`;

  const plan = await callGrokJson<GrokPlan>({
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
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
  };
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

import type { Profile } from "@/lib/types";

/** Formatiert eine Zahl deutsch (Komma). */
export function de(n: number, digits = 1): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function calcBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  if (m <= 0) return null;
  return weightKg / (m * m);
}

export function bmiCategory(bmi: number | null): { label: string; tag: "warn" | "ok" } {
  if (bmi == null) return { label: "—", tag: "ok" };
  if (bmi < 18.5) return { label: "UNTERGEWICHT", tag: "warn" };
  if (bmi < 25) return { label: "NORMALGEWICHT", tag: "ok" };
  if (bmi < 30) return { label: "ÜBERGEWICHT", tag: "warn" };
  return { label: "ADIPOSITAS", tag: "warn" };
}

/** Position des BMI-Markers auf der Skala 15–45 (in %). */
export function bmiScalePos(bmi: number | null): number {
  if (bmi == null) return 0;
  return Math.max(0, Math.min(100, ((bmi - 15) / (45 - 15)) * 100));
}

export function dashboardMetrics(p: Profile | null) {
  const start = p?.start_weight_kg ?? null;
  const current = p?.current_weight_kg ?? start;
  const goal = p?.goal_weight_kg ?? null;
  const bmi = calcBmi(current, p?.height_cm ?? null);
  const goalBmi = calcBmi(goal, p?.height_cm ?? null);

  let lost = 0;
  let toGo = 0;
  let progressPct = 0;
  if (start != null && goal != null && current != null) {
    lost = Math.max(0, start - current);
    toGo = Math.max(0, current - goal);
    const total = start - goal;
    progressPct = total > 0 ? Math.max(0, Math.min(100, (lost / total) * 100)) : 0;
  }
  const goalDiff = start != null && goal != null ? Math.max(0, start - goal) : 0;

  return { start, current, goal, bmi, goalBmi, lost, toGo, progressPct, goalDiff };
}

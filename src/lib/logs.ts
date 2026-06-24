"use client";

import { createClient } from "@/lib/supabase/client";

export type Dose = { id: string; medication: string | null; dose: string | null; taken_on: string };

/** Lokales Datum als YYYY-MM-DD. */
export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

async function uid(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return user.id;
}

export async function getDailyLog(): Promise<{ water_ml: number; kcal: number }> {
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_logs")
    .select("water_ml, kcal")
    .eq("log_date", todayStr())
    .maybeSingle();
  return { water_ml: data?.water_ml ?? 0, kcal: data?.kcal ?? 0 };
}

export async function saveDailyLog(water_ml: number, kcal: number): Promise<void> {
  const supabase = createClient();
  const user_id = await uid();
  const { error } = await supabase
    .from("daily_logs")
    .upsert(
      { user_id, log_date: todayStr(), water_ml: Math.max(0, water_ml), kcal: Math.max(0, kcal), updated_at: new Date().toISOString() },
      { onConflict: "user_id,log_date" },
    );
  if (error) throw error;
}

export async function listDoses(): Promise<Dose[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doses")
    .select("id, medication, dose, taken_on")
    .order("taken_on", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Dose[];
}

export async function addDose(d: { medication: string; dose: string; taken_on: string }): Promise<Dose> {
  const supabase = createClient();
  const user_id = await uid();
  const { data, error } = await supabase
    .from("doses")
    .insert({ user_id, ...d })
    .select("id, medication, dose, taken_on")
    .single();
  if (error) throw error;
  return data as Dose;
}

export async function removeDose(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("doses").delete().eq("id", id);
  if (error) throw error;
}

/** Aktualisiert das aktuelle Gewicht (für die Fortschrittsberechnung). */
export async function updateCurrentWeight(weightKg: number): Promise<void> {
  const supabase = createClient();
  const user_id = await uid();
  const { error } = await supabase
    .from("profiles")
    .update({ current_weight_kg: weightKg, updated_at: new Date().toISOString() })
    .eq("user_id", user_id);
  if (error) throw error;
}

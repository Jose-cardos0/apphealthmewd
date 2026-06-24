"use client";

import { createClient } from "@/lib/supabase/client";
import { todayStr } from "@/lib/logs";
import type { Workout, SavedWorkout, WorkoutLog } from "@/lib/types";

async function uid(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return user.id;
}

export async function listWorkouts(): Promise<SavedWorkout[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("id, title, data")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedWorkout[];
}

export async function addWorkout(title: string, data: Workout): Promise<SavedWorkout> {
  const supabase = createClient();
  const user_id = await uid();
  const { data: row, error } = await supabase
    .from("workouts")
    .insert({ user_id, title, data })
    .select("id, title, data")
    .single();
  if (error) throw error;
  return row as SavedWorkout;
}

export async function removeWorkout(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

/** Markiert ein Workout als heute erledigt und protokolliert die verbrannten Kalorien. */
export async function logWorkoutDone(w: { id?: string; title: string; burned_kcal: number }): Promise<WorkoutLog> {
  const supabase = createClient();
  const user_id = await uid();
  const { data, error } = await supabase
    .from("workout_logs")
    .insert({ user_id, workout_id: w.id ?? null, title: w.title, burned_kcal: w.burned_kcal, done_on: todayStr() })
    .select("id, title, burned_kcal, done_on")
    .single();
  if (error) throw error;
  return data as WorkoutLog;
}

export async function removeWorkoutLog(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("workout_logs").delete().eq("id", id);
  if (error) throw error;
}

/** Heute erledigte Trainings + verbrannte Kalorien. */
export async function getTodayWorkoutLogs(): Promise<WorkoutLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .select("id, title, burned_kcal, done_on")
    .eq("done_on", todayStr())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WorkoutLog[];
}

export async function getTodayBurned(): Promise<number> {
  const logs = await getTodayWorkoutLogs();
  return logs.reduce((sum, l) => sum + (l.burned_kcal || 0), 0);
}

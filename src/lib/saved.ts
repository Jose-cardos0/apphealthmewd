"use client";

import { createClient } from "@/lib/supabase/client";
import type { SavedItem, SavedKind } from "@/lib/types";

/**
 * Client-seitige Helfer für gespeicherte Inhalte.
 * Zugriff über den authentifizierten Browser-Client; Row-Level-Security
 * stellt sicher, dass jeder Nutzer nur seine eigenen Daten sieht.
 */

export async function listSaved<T>(kind: SavedKind): Promise<SavedItem<T>[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_items")
    .select("id, data")
    .eq("kind", kind)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SavedItem<T>[];
}

export async function addSaved<T>(kind: SavedKind, data: T): Promise<SavedItem<T>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");

  const { data: row, error } = await supabase
    .from("saved_items")
    .insert({ kind, data, user_id: user.id })
    .select("id, data")
    .single();

  if (error) throw error;
  return row as SavedItem<T>;
}

export async function removeSaved(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("saved_items").delete().eq("id", id);
  if (error) throw error;
}

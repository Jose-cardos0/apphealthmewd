"use client";

import { createClient } from "@/lib/supabase/client";
import { resizeImageToBlob } from "@/lib/image";

/**
 * Lädt ein Profilfoto in den Supabase-Storage (Bucket "avatars") und
 * speichert die öffentliche URL in profiles.avatar_url. Gibt die URL zurück.
 */
export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");

  const blob = await resizeImageToBlob(file, 512, 0.85);
  const path = `${user.id}/avatar.jpg`;

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const { error: updErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
  if (updErr) throw updErr;

  return url;
}

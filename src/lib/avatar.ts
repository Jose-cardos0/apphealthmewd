import type { Profile } from "@/lib/types";

/** Altersband für die Standard-Avatare. */
export function ageBand(age: number | null | undefined): string {
  const a = Number(age);
  if (!Number.isFinite(a) || a <= 29) return "18-29";
  if (a <= 34) return "30-34";
  if (a <= 39) return "35-39";
  return "40+";
}

/** Standard-Avatar (Pixar-Porträt) nach Geschlecht + Alter. */
export function defaultAvatar(gender: string | null | undefined, age: number | null | undefined): string | null {
  if (gender === "Mann") return `/idade/homem${ageBand(age)}.png`;
  if (gender === "Frau") return `/idade/mulher${ageBand(age)}.png`;
  return null;
}

/**
 * Bildquelle für den Avatar eines Nutzers.
 * Priorität: hochgeladenes Foto → Standard-Avatar (Geschlecht + Alter) → null (Initialen).
 */
export function avatarSrc(profile: Profile | null): string | null {
  if (profile?.avatar_url) return profile.avatar_url;
  return defaultAvatar(profile?.gender, profile?.age);
}

export function avatarInitials(profile: Profile | null): string {
  const a = profile?.first_name?.[0];
  const b = profile?.last_name?.[0];
  const s = [a, b].filter(Boolean).join("");
  return (s || "?").toUpperCase();
}

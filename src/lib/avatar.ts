import type { Profile } from "@/lib/types";

/**
 * Bildquelle für den Avatar eines Nutzers.
 * Priorität: hochgeladenes Foto → geschlechts-Avatar → null (dann Initialen).
 */
export function avatarSrc(profile: Profile | null): string | null {
  if (profile?.avatar_url) return profile.avatar_url;
  if (profile?.gender === "Mann") return "/avatar-mann.jpg";
  if (profile?.gender === "Frau") return "/avatar-frau.jpg";
  return null;
}

export function avatarInitials(profile: Profile | null): string {
  const a = profile?.first_name?.[0];
  const b = profile?.last_name?.[0];
  const s = [a, b].filter(Boolean).join("");
  return (s || "?").toUpperCase();
}

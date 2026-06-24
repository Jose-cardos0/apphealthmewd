import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Pfade, die ohne Login erreichbar sind. */
const PUBLIC_PATHS = [
  "/login",
  "/passwort-vergessen",
  "/passwort-zuruecksetzen",
  "/konto-deaktiviert",
];

/**
 * Aktualisiert die Supabase-Session (Cookie-Refresh) und steuert die
 * Zugriffslogik:
 *  - nicht eingeloggt  → /login
 *  - Konto deaktiviert → /konto-deaktiviert
 *  - erster Login      → /passwort-aendern (Pflicht)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Falls die Supabase-Variablen (noch) nicht gesetzt sind, das Middleware
  // nicht crashen lassen – Request einfach durchlassen, statt die ganze Seite
  // mit MIDDLEWARE_INVOCATION_FAILED zu blockieren.
  if (!url || !anonKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen.",
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    // Netzwerk-/Konfigurationsfehler nicht die ganze Seite lahmlegen lassen.
    console.error("[middleware] auth.getUser fehlgeschlagen:", err);
    return supabaseResponse;
  }

  const path = request.nextUrl.pathname;

  // API-Routen kümmern sich selbst um Authentifizierung – keine Redirects,
  // nur den Session-Cookie aktualisieren.
  if (path.startsWith("/api/")) return supabaseResponse;

  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  // Nicht eingeloggt → nur öffentliche Seiten erlaubt
  if (!user) {
    if (isPublic) return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Eingeloggt:
  const meta = user.app_metadata || {};
  const isActive = meta.active !== false; // Standard: aktiv
  const mustChange = meta.must_change_password === true;
  const onboarded = meta.onboarding_completed === true;

  const redirect = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
  };

  // Deaktiviertes Konto (z. B. nach Rückerstattung)
  if (!isActive) {
    return path === "/konto-deaktiviert" ? supabaseResponse : redirect("/konto-deaktiviert");
  }

  // 1) Pflicht zum Passwort-Wechsel beim ersten Login
  if (mustChange) {
    return path === "/passwort-aendern" ? supabaseResponse : redirect("/passwort-aendern");
  }

  // 2) Onboarding-Quiz, falls noch nicht abgeschlossen
  if (!onboarded) {
    return path === "/onboarding" ? supabaseResponse : redirect("/onboarding");
  }

  // 3) Fertig eingerichtet → weg von Login/Setup-Seiten
  if (path === "/login" || path === "/passwort-aendern" || path === "/onboarding") {
    return redirect("/app");
  }

  return supabaseResponse;
}

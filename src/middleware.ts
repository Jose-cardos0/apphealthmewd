import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (err) {
    // Letzte Sicherung: niemals die ganze Seite mit 500 blockieren.
    console.error("[middleware] unerwarteter Fehler:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer:
     * - _next/static, _next/image (Build-Assets)
     * - favicon, logo, Bilddateien
     * - PWA-Dateien: manifest.webmanifest, sw.js (müssen ohne Login erreichbar
     *   sein, sonst kann Chrome die App nicht installieren – nur Verknüpfung)
     * - /api/webhooks/* (Webhooks brauchen keine Session)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.webmanifest|sw.js|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

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
     * - /api/webhooks/* (Webhooks brauchen keine Session)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

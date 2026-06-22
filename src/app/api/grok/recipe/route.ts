import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist eine freundliche deutsche Koch-Assistentin. " +
  "Erstelle aus den gegebenen Zutaten ein einfaches, leckeres Rezept. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"titel": "Name des Gerichts", "meta": "z.B. ⏱️ 20 Min. · 🍽️ 2 Portionen", ' +
  '"schritte": ["Schritt 1", "Schritt 2", "..."], ' +
  '"naehrwerte": {"kcal": "250", "eiweiss": "12 g", "kohlenhydrate": "30 g", "fett": "8 g"}}. ' +
  "Alle Texte auf Deutsch. Die Nährwerte beziehen sich auf eine Portion.";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { ingredients } = (await req.json()) as { ingredients: string[] };
    const list = Array.isArray(ingredients) ? ingredients : [];

    const rezept = await callGrokJson({
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Meine Zutaten: " + list.join(", ") },
      ],
    });

    return NextResponse.json(rezept);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

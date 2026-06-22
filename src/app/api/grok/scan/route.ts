import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist ein deutscher Ernährungsexperte der App HealthMe. " +
  "Schätze für die beschriebene Mahlzeit realistische Nährwerte. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"gericht":"kurzer Name der Mahlzeit","portion":"z.B. 1 Portion (ca. 350 g)",' +
  '"kcal":"462","eiweiss":"41 g","kohlenhydrate":"52 g","fett":"9 g",' +
  '"hinweis":"kurzer, hilfreicher Ernährungstipp"}. Alle Texte auf Deutsch.';

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { text } = (await req.json()) as { text: string };

    const scan = await callGrokJson({
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Meine Mahlzeit: " + (text || "") },
      ],
    });

    return NextResponse.json(scan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

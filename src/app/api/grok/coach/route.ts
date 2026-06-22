import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist ein erfahrener deutscher Personal Trainer der App HealthMe. " +
  "Erstelle einen sicheren, effektiven Trainingsplan für zu Hause OHNE Geräte " +
  "(nur Körpergewicht, optional Stuhl oder Matte). " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"titel":"Name des Plans","meta":"z.B. ⏱️ 20 Min · 🏠 ohne Geräte · 🎯 Abnehmen",' +
  '"aufwaermen":["Übung 1","Übung 2"],' +
  '"uebungen":[{"name":"Übung","saetze":"3 × 15","hinweis":"kurzer Ausführungs-Tipp"}],' +
  '"tipps":["Tipp 1","Tipp 2"]}. ' +
  "Alle Texte auf Deutsch. 4 bis 7 Hauptübungen. Passe Intensität an Level und Zeit an.";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { goal, level, time, focus } = (await req.json()) as Record<string, string>;
    const userPrompt =
      `Ziel: ${goal}. Level: ${level}. Zeit pro Einheit: ${time}. Fokus: ${focus}.`;

    const plan = await callGrokJson({
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    return NextResponse.json(plan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

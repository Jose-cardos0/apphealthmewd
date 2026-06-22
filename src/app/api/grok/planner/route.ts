import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist ein deutscher Ernährungscoach der App HealthMe. " +
  "Erstelle einen abwechslungsreichen, ausgewogenen 7-Tage-Ernährungsplan. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"titel":"Name des Plans","meta":"z.B. 🎯 Abnehmen · ~1600 kcal/Tag · 4 Mahlzeiten",' +
  '"tage":[{"tag":"Montag","mahlzeiten":[{"name":"Frühstück","gericht":"kurze Beschreibung"}]}]}. ' +
  "Genau 7 Tage von Montag bis Sonntag. Alle Texte auf Deutsch. Halte die Gerichte einfach und alltagstauglich.";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { goal, kcal, meals, diet } = (await req.json()) as Record<string, string>;
    const userPrompt =
      `Ziel: ${goal}. Kalorien pro Tag: ${kcal}. Mahlzeiten pro Tag: ${meals}. Ernährungsform: ${diet}.`;

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

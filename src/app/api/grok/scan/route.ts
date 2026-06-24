import { NextRequest, NextResponse } from "next/server";
import { callGrokVisionJson, requireUser } from "@/lib/grok";

export const maxDuration = 60;

const SYSTEM_PROMPT =
  "Du bist ein deutscher Ernährungsexperte der App HealthMe GLP-1. " +
  "Du analysierst ein Foto einer Mahlzeit und schätzt die enthaltenen Lebensmittel und deren Nährwerte. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"erkannt": true, "gericht": "kurzer Name der Mahlzeit", ' +
  '"lebensmittel": [{"name": "Lebensmittel", "kcal": 165, "detail": "31 g Protein"}], ' +
  '"summe": {"kcal": 612, "protein_g": 32, "kohlenhydrate_g": 64, "fett_g": 22, "ballaststoffe_g": 9}}. ' +
  "Schätze realistische Werte. Wenn auf dem Bild KEIN Essen erkennbar ist, antworte mit " +
  '{"erkannt": false}. Alle Texte auf Deutsch.';

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { image } = (await req.json()) as { image?: string };
    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Kein gültiges Bild." }, { status: 400 });
    }

    const result = await callGrokVisionJson({
      system: SYSTEM_PROMPT,
      prompt: "Analysiere diese Mahlzeit und schätze die Nährwerte so genau wie möglich.",
      imageDataUrl: image,
      temperature: 0.3,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

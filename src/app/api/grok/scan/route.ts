import { NextRequest, NextResponse } from "next/server";
import { callGrokVisionJson, requireUser } from "@/lib/grok";

export const maxDuration = 60;

const SYSTEM_PROMPT_DE =
  "Du bist ein deutscher Ernährungsexperte der App HealthMe GLP-1. " +
  "Du analysierst ein Foto einer Mahlzeit und schätzt die enthaltenen Lebensmittel und deren Nährwerte. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"erkannt": true, "gericht": "kurzer Name der Mahlzeit", ' +
  '"lebensmittel": [{"name": "Lebensmittel", "kcal": 165, "detail": "31 g Protein"}], ' +
  '"summe": {"kcal": 612, "protein_g": 32, "kohlenhydrate_g": 64, "fett_g": 22, "ballaststoffe_g": 9}}. ' +
  "Schätze realistische Werte. Wenn auf dem Bild KEIN Essen erkennbar ist, antworte mit " +
  '{"erkannt": false}. Alle Texte auf Deutsch.';

const SYSTEM_PROMPT_EN =
  "You are a nutrition expert of the HealthMe GLP-1 app. " +
  "You analyze a photo of a meal and estimate the foods it contains and their nutritional values. " +
  "Reply EXCLUSIVELY with valid JSON, no markdown, in the following format (keep the German JSON keys exactly): " +
  '{"erkannt": true, "gericht": "short name of the meal", ' +
  '"lebensmittel": [{"name": "Food", "kcal": 165, "detail": "31 g protein"}], ' +
  '"summe": {"kcal": 612, "protein_g": 32, "kohlenhydrate_g": 64, "fett_g": 22, "ballaststoffe_g": 9}}. ' +
  "Estimate realistic values. If NO food is recognizable in the image, reply with " +
  '{"erkannt": false}. All text values in English (keys stay as shown).';

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { image, lang } = (await req.json()) as { image?: string; lang?: string };
    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Kein gültiges Bild." }, { status: 400 });
    }
    const isEn = lang === "en";

    const result = await callGrokVisionJson({
      system: isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_DE,
      prompt: isEn
        ? "Analyze this meal and estimate the nutritional values as accurately as possible."
        : "Analysiere diese Mahlzeit und schätze die Nährwerte so genau wie möglich.",
      imageDataUrl: image,
      temperature: 0.3,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

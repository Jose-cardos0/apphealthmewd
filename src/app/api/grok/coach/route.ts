import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT =
  "Du bist Flufy, der KI-Fitness-Coach der App HealthMe GLP-1. Du bist eine KI und stützt dich auf allgemein " +
  "verfügbare Informationen – keine ärztliche oder physiotherapeutische Beratung. " +
  "Erstelle ein sicheres, alltagstaugliches Trainings-Workout mit Fokus auf ABNEHMEN und LEICHTES CARDIO, " +
  "passend zu den Nutzerdaten (Alter, Geschlecht, Gewicht, Zielgewicht, Aktivitätslevel). " +
  "Wähle moderate, gelenkschonende Übungen; bei höherem Gewicht/Anfängern entsprechend sanfter. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"titel":"Name des Workouts","fokus":"z. B. Ganzkörper · Abnehmen","dauer_min":35,"kcal_verbrennung":280,' +
  '"uebungen":[{"name":"Übung","saetze":"3","wdh":"12","pause_sek":"45","hinweis":"kurzer Ausführungstipp"}],' +
  '"cardio":[{"name":"Zügiges Gehen","dauer":"10 Min","hinweis":"locker, du kannst dich noch unterhalten"}],' +
  '"tipps":["kurzer Tipp 1","kurzer Tipp 2"]}. ' +
  "kcal_verbrennung = realistische geschätzte Kalorien für die ganze Einheit (ganze Zahl). " +
  "5–7 Übungen, 1–2 Cardio-Einheiten. Alle Texte auf Deutsch.";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { wish } = (await req.json().catch(() => ({}))) as { wish?: string };

    const supabase = await createClient();
    const { data: p } = await supabase
      .from("profiles")
      .select("age, gender, height_cm, current_weight_kg, goal_weight_kg, activity_level")
      .eq("user_id", user.id)
      .maybeSingle();

    const profilLine = p
      ? `Geschlecht ${p.gender || "?"}, Alter ${p.age || "?"}, Größe ${p.height_cm || "?"} cm, ` +
        `Gewicht ${p.current_weight_kg || "?"} kg, Zielgewicht ${p.goal_weight_kg || "?"} kg, ` +
        `Aktivität ${p.activity_level || "?"}.`
      : "Keine Profildaten vorhanden.";

    const userPrompt =
      `Nutzerprofil: ${profilLine}` +
      (wish && wish.trim() ? ` Wunsch des Nutzers: "${wish.trim()}".` : " Erstelle ein passendes Workout zum Abnehmen.");

    const workout = await callGrokJson({
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    return NextResponse.json(workout);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";
import { createClient } from "@/lib/supabase/server";
import type { WeeklyPlan } from "@/lib/types";

export const maxDuration = 60;

const SYSTEM_PROMPT =
  "Du bist Flufy, der KI-Fitness-Coach der App HealthMe GLP-1. Du bist eine KI und stützt dich auf allgemein " +
  "verfügbare Informationen – keine ärztliche oder physiotherapeutische Beratung. " +
  "Erstelle einen kompletten 7-Tage-Trainingsplan (Montag bis Sonntag) mit Fokus auf ABNEHMEN und LEICHTES CARDIO, " +
  "passend zu den Nutzerdaten (Alter, Geschlecht, Gewicht, Zielgewicht, Aktivitätslevel). " +
  "Plane sinnvoll Trainingstage UND Ruhetage (je nach Level 3–5 Trainingstage, der Rest sind Ruhetage). " +
  "Wähle moderate, gelenkschonende Übungen; bei höherem Gewicht/Anfängern sanfter. " +
  "Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, in folgendem Format: " +
  '{"titel":"Deine Trainingswoche","fokus":"z. B. Abnehmen · Ganzkörper","tage":[' +
  '{"tag":"Montag","rest":false,"titel":"Ganzkörper","fokus":"Beine & Core","dauer_min":35,"kcal_verbrennung":280,' +
  '"uebungen":[{"name":"Übung auf Deutsch","en":"gebräuchlicher englischer Übungsname, der in einer Fitness-Datenbank existiert, z. B. squat, push up, lunge, plank, glute bridge, mountain climber, jumping jack, crunch, bird dog, hip thrust, high knees","saetze":"3","wdh":"12","pause_sek":"45","hinweis":"kurzer Tipp"}],' +
  '"cardio":[{"name":"Zügiges Gehen","dauer":"10 Min","hinweis":"locker"}]},' +
  '{"tag":"Dienstag","rest":true}]}. ' +
  "GENAU 7 Tage von Montag bis Sonntag. Trainingstage: 4–6 Übungen + 1 Cardio-Einheit. " +
  "Ruhetage nur als {\"tag\":\"...\",\"rest\":true}. kcal_verbrennung = realistische ganze Zahl pro Trainingseinheit. " +
  "Alle Texte auf Deutsch, nur das Feld en in Englisch.";

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
      `Nutzerprofil: ${profilLine} Erstelle den kompletten Wochenplan zum Abnehmen.` +
      (wish && wish.trim() ? ` Zusätzlicher Wunsch: "${wish.trim()}".` : "");

    // GIFs werden beim Anzeigen über /api/exercise-gif?q=<en> geladen (mit Cache).
    const plan = await callGrokJson<WeeklyPlan>({
      temperature: 0.6,
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

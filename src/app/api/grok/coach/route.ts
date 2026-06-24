import { NextRequest, NextResponse } from "next/server";
import { callGrokJson, requireUser } from "@/lib/grok";
import { createClient } from "@/lib/supabase/server";
import type { WeeklyPlan } from "@/lib/types";

export const maxDuration = 60;

/**
 * Sucht in der ExerciseDB (RapidAPI) nach dem Begriff und liefert die URL
 * unseres GIF-Proxys (über die Exercise-ID). Best effort.
 */
async function fetchExerciseGif(term: string): Promise<string | null> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key || !term) return null;
  const headers = { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "exercisedb.p.rapidapi.com" };
  const tryTerm = async (t: string): Promise<string | null> => {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(t.toLowerCase())}?limit=1`,
      { headers },
    );
    if (!res.ok) return null;
    const arr = await res.json();
    const id = Array.isArray(arr) && arr[0]?.id ? String(arr[0].id) : null;
    return id ? `/api/exercise-gif?id=${id}` : null;
  };
  try {
    // Erst den vollen Begriff, dann eine vereinfachte Variante (letzte 2 Wörter)
    const direct = await tryTerm(term);
    if (direct) return direct;
    const words = term.trim().split(/\s+/);
    if (words.length > 2) return await tryTerm(words.slice(-2).join(" "));
    return null;
  } catch {
    return null;
  }
}

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

    const plan = await callGrokJson<WeeklyPlan>({
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    // GIFs anreichern – Übungen über alle Tage sammeln, pro Suchbegriff nur EINMAL abfragen.
    if (process.env.RAPIDAPI_KEY && Array.isArray(plan?.tage)) {
      const allEx = plan.tage.flatMap((d) => (Array.isArray(d.uebungen) ? d.uebungen : []));
      const terms = Array.from(new Set(allEx.map((u) => (u.en || u.name || "").toLowerCase()).filter(Boolean)));
      const gifMap = new Map<string, string | null>();
      await Promise.all(terms.map(async (t) => gifMap.set(t, await fetchExerciseGif(t))));
      for (const u of allEx) {
        u.gifUrl = gifMap.get((u.en || u.name || "").toLowerCase()) ?? null;
      }
    }

    return NextResponse.json(plan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

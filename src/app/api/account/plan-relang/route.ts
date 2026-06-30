import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePlan } from "@/lib/plan";

/**
 * Erzeugt den persönlichen Plan (motivation/tips) in der gewünschten Sprache neu,
 * wenn der Nutzer die App-Sprache wechselt. Werte bleiben sonst identisch.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { lang } = (await req.json().catch(() => ({}))) as { lang?: string };
  const targetLang = lang === "en" ? "en" : "de";

  const { data: p } = await supabase
    .from("profiles")
    .select("age, gender, height_cm, start_weight_kg, current_weight_kg, goal_weight_kg, activity_level, glp1_medication, glp1_dose, glp1_frequency")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!p) return NextResponse.json({ error: "Kein Profil." }, { status: 404 });

  let plan;
  try {
    plan = await generatePlan({
      gender: p.gender ?? undefined,
      age: p.age ?? undefined,
      height_cm: p.height_cm ?? undefined,
      start_weight_kg: (p.current_weight_kg ?? p.start_weight_kg) ?? undefined,
      goal_weight_kg: p.goal_weight_kg ?? undefined,
      activity_level: p.activity_level ?? undefined,
      glp1_medication: p.glp1_medication ?? undefined,
      glp1_dose: p.glp1_dose ?? undefined,
      glp1_frequency: p.glp1_frequency ?? undefined,
      lang: targetLang,
    });
  } catch (err) {
    console.error("[plan-relang] Grok-Plan fehlgeschlagen:", err);
    return NextResponse.json({ error: "Plan konnte nicht erstellt werden." }, { status: 502 });
  }

  const { error: upErr } = await supabase.from("profiles").update({ plan }).eq("user_id", user.id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ plan });
}

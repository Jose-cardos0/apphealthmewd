import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePlan } from "@/lib/plan";
import type { OnboardingData } from "@/lib/types";

/**
 * Speichert die Onboarding-Daten in der profiles-Tabelle und setzt
 * app_metadata.onboarding_completed = true (damit das Middleware den
 * Nutzer ab jetzt direkt ins Dashboard lässt).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  let body: Partial<OnboardingData> & { lang?: string };
  try {
    body = (await req.json()) as Partial<OnboardingData> & { lang?: string };
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const num = (v: unknown) => {
    const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : (v as number);
    return Number.isFinite(n) ? n : null;
  };

  // Bei einer Bearbeitung das ursprüngliche Startgewicht erhalten,
  // damit der Fortschritt nicht zurückgesetzt wird.
  const { data: existing } = await supabase
    .from("profiles")
    .select("start_weight_kg")
    .eq("user_id", user.id)
    .maybeSingle();

  const enteredWeight = num(body.start_weight_kg);
  const startWeight = existing?.start_weight_kg ?? enteredWeight;

  const profile = {
    user_id: user.id,
    first_name: (body.first_name || "").trim() || null,
    last_name: (body.last_name || "").trim() || null,
    age: body.age != null ? Math.round(num(body.age) ?? 0) || null : null,
    city: (body.city || "").trim() || null,
    gender: body.gender || null,
    height_cm: num(body.height_cm),
    start_weight_kg: startWeight,
    current_weight_kg: enteredWeight,
    goal_weight_kg: num(body.goal_weight_kg),
    activity_level: body.activity_level || null,
    glp1_medication: body.glp1_medication || null,
    glp1_dose: body.glp1_dose || null,
    glp1_frequency: body.glp1_frequency || null,
    updated_at: new Date().toISOString(),
  };

  // Personalisierte Tagesrichtwerte von Grok erzeugen (best effort)
  let plan = null;
  try {
    plan = await generatePlan(body);
  } catch (err) {
    console.error("[onboarding] Grok-Plan fehlgeschlagen:", err);
  }

  // Profil + Plan speichern (eigene Zeile, durch RLS abgesichert)
  const { error: upErr } = await supabase
    .from("profiles")
    .upsert({ ...profile, plan }, { onConflict: "user_id" });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // Flag setzen (nur per Service-Role möglich)
  const admin = createAdminClient();
  const { error: metaErr } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, onboarding_completed: true },
  });
  if (metaErr) {
    return NextResponse.json({ error: metaErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

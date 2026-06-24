import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  let body: Partial<OnboardingData>;
  try {
    body = (await req.json()) as Partial<OnboardingData>;
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const num = (v: unknown) => {
    const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : (v as number);
    return Number.isFinite(n) ? n : null;
  };

  const profile = {
    user_id: user.id,
    first_name: (body.first_name || "").trim() || null,
    last_name: (body.last_name || "").trim() || null,
    age: body.age != null ? Math.round(num(body.age) ?? 0) || null : null,
    city: (body.city || "").trim() || null,
    gender: body.gender || null,
    height_cm: num(body.height_cm),
    start_weight_kg: num(body.start_weight_kg),
    current_weight_kg: num(body.start_weight_kg),
    goal_weight_kg: num(body.goal_weight_kg),
    activity_level: body.activity_level || null,
    glp1_medication: body.glp1_medication || null,
    glp1_dose: body.glp1_dose || null,
    glp1_frequency: body.glp1_frequency || null,
    updated_at: new Date().toISOString(),
  };

  // Profil speichern (eigene Zeile, durch RLS abgesichert)
  const { error: upErr } = await supabase.from("profiles").upsert(profile, { onConflict: "user_id" });
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

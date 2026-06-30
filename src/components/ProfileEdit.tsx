"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, User2, HeartPulse, RotateCcw } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

// Kanonische (deutsche) Werte – werden so im Backend gespeichert.
const GENDERS = ["Frau", "Mann", "Divers"];
const ACTIVITIES = ["Wenig aktiv", "Leicht aktiv", "Mäßig aktiv", "Sehr aktiv"];
const MEDS = ["Ozempic", "Wegovy", "Mounjaro", "Saxenda", "Rybelsus", "Noch keins"];
const DOSES = ["0,25 mg", "0,5 mg", "1,0 mg", "1,7 mg", "2,4 mg", "Andere"];
const FREQS = ["Wöchentlich", "Täglich"];

const TX = {
  de: {
    back: "Zurück",
    title: "Meine Daten",
    hint: "Aktualisiere deine Angaben – HealthMe berechnet deinen Plan danach neu.",
    aboutYou: "Über dich",
    firstName: "Vorname",
    lastName: "Nachname",
    age: "Alter",
    city: "Stadt",
    gender: "Geschlecht",
    height: "Größe (cm)",
    currentWeight: "Aktuelles Gewicht (kg)",
    goalWeight: "Wunschgewicht (kg)",
    planSection: "Dein GLP-1 Plan",
    activity: "Aktivität",
    medication: "GLP-1 Medikament",
    dose: "Dosis",
    frequency: "Häufigkeit",
    next: "Weiter",
    saving: "Wird gespeichert …",
    save: "Speichern & Plan neu berechnen",
    recalcOverlay: "Dein Plan wird neu berechnet …",
    resetOverlay: "Einrichtung wird zurückgesetzt …",
    restartTitle: "App neu einrichten",
    restartDesc: "Du kannst den Einrichtungs-Quiz noch einmal von vorne durchlaufen und alle Angaben neu eingeben.",
    restartBtn: "Einrichtung neu starten",
    genericError: "Etwas ist schiefgelaufen.",
    fallbackError: "Fehler",
    // Option-Labels (Anzeige) – Schlüssel = kanonischer deutscher Wert
    genderLabels: { Frau: "Frau", Mann: "Mann", Divers: "Divers" } as Record<string, string>,
    activityLabels: {
      "Wenig aktiv": "Wenig aktiv",
      "Leicht aktiv": "Leicht aktiv",
      "Mäßig aktiv": "Mäßig aktiv",
      "Sehr aktiv": "Sehr aktiv",
    } as Record<string, string>,
    medLabels: {
      Ozempic: "Ozempic",
      Wegovy: "Wegovy",
      Mounjaro: "Mounjaro",
      Saxenda: "Saxenda",
      Rybelsus: "Rybelsus",
      "Noch keins": "Noch keins",
    } as Record<string, string>,
    doseLabels: {
      "0,25 mg": "0,25 mg",
      "0,5 mg": "0,5 mg",
      "1,0 mg": "1,0 mg",
      "1,7 mg": "1,7 mg",
      "2,4 mg": "2,4 mg",
      Andere: "Andere",
    } as Record<string, string>,
    freqLabels: { Wöchentlich: "Wöchentlich", Täglich: "Täglich" } as Record<string, string>,
  },
  en: {
    back: "Back",
    title: "My details",
    hint: "Update your details – HealthMe will recalculate your plan afterwards.",
    aboutYou: "About you",
    firstName: "First name",
    lastName: "Last name",
    age: "Age",
    city: "City",
    gender: "Gender",
    height: "Height (cm)",
    currentWeight: "Current weight (kg)",
    goalWeight: "Goal weight (kg)",
    planSection: "Your GLP-1 plan",
    activity: "Activity",
    medication: "GLP-1 medication",
    dose: "Dose",
    frequency: "Frequency",
    next: "Next",
    saving: "Saving …",
    save: "Save & recalculate plan",
    recalcOverlay: "Recalculating your plan …",
    resetOverlay: "Resetting your setup …",
    restartTitle: "Set up the app again",
    restartDesc: "You can run through the setup quiz from the start again and re-enter all your details.",
    restartBtn: "Restart setup",
    genericError: "Something went wrong.",
    fallbackError: "Error",
    // Option labels (display) – key = canonical German value
    genderLabels: { Frau: "Female", Mann: "Male", Divers: "Diverse" } as Record<string, string>,
    activityLabels: {
      "Wenig aktiv": "Barely active",
      "Leicht aktiv": "Lightly active",
      "Mäßig aktiv": "Moderately active",
      "Sehr aktiv": "Very active",
    } as Record<string, string>,
    medLabels: {
      Ozempic: "Ozempic",
      Wegovy: "Wegovy",
      Mounjaro: "Mounjaro",
      Saxenda: "Saxenda",
      Rybelsus: "Rybelsus",
      "Noch keins": "None yet",
    } as Record<string, string>,
    doseLabels: {
      "0,25 mg": "0.25 mg",
      "0,5 mg": "0.5 mg",
      "1,0 mg": "1.0 mg",
      "1,7 mg": "1.7 mg",
      "2,4 mg": "2.4 mg",
      Andere: "Other",
    } as Record<string, string>,
    freqLabels: { Wöchentlich: "Weekly", Täglich: "Daily" } as Record<string, string>,
  },
} as const;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function ProfileEdit({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    age: profile?.age != null ? String(profile.age) : "",
    city: profile?.city ?? "",
    gender: profile?.gender ?? "Frau",
    height_cm: profile?.height_cm != null ? String(profile.height_cm) : "",
    start_weight_kg: profile?.current_weight_kg != null ? String(profile.current_weight_kg) : "",
    goal_weight_kg: profile?.goal_weight_kg != null ? String(profile.goal_weight_kg) : "",
    activity_level: profile?.activity_level ?? "Leicht aktiv",
    glp1_medication: profile?.glp1_medication ?? "Noch keins",
    glp1_dose: profile?.glp1_dose ?? "0,25 mg",
    glp1_frequency: profile?.glp1_frequency ?? "Wöchentlich",
  });
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof d>) => setD((p) => ({ ...p, ...patch }));

  async function restart() {
    setRestarting(true);
    try {
      await fetch("/api/account/onboarding-reset", { method: "POST" });
      await createClient().auth.refreshSession();
      router.replace("/onboarding");
      router.refresh();
    } catch {
      setRestarting(false);
    }
  }

  const step0Valid =
    d.first_name.trim() && d.last_name.trim() && Number(d.age) > 0 &&
    d.city.trim() && Number(d.height_cm) > 0 && Number(d.start_weight_kg) > 0 && Number(d.goal_weight_kg) > 0;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, lang }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t.fallbackError);
      router.replace("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
      setSaving(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isDesktop && step === 0) {
      if (step0Valid) setStep(1);
      return;
    }
    save();
  }

  const showStep0 = isDesktop || step === 0;
  const showStep1 = isDesktop || step === 1;

  return (
    <div className="quiz">
      {saving && <LoadingOverlay text={t.recalcOverlay} />}
      {restarting && <LoadingOverlay text={t.resetOverlay} />}
      <div className="qz-inner pe-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <button className="qz-back" style={{ flex: "0 0 44px", height: 44 }} onClick={() => router.replace("/app")} aria-label={t.back}>
            <ArrowLeft size={18} style={{ display: "block", margin: "0 auto" }} />
          </button>
          <h2 className="qz-q" style={{ fontSize: 22, margin: 0 }}>{t.title}</h2>
        </div>
        <p className="qz-hint" style={{ marginBottom: 16 }}>
          {t.hint}
        </p>

        {!isDesktop && (
          <div className="qz-prog" style={{ marginBottom: 16 }}>
            <i style={{ width: step === 0 ? "50%" : "100%" }} />
          </div>
        )}

        <form onSubmit={onSubmit} className="pe-form">
          <div className="pe-cols">
            <section className="pe-step" style={{ display: showStep0 ? "block" : "none" }}>
              <div className="pe-sec"><User2 size={17} /> {t.aboutYou}</div>
              <Row>
                <Field label={t.firstName}><input className="qz-input" value={d.first_name} onChange={(e) => set({ first_name: e.target.value })} /></Field>
                <Field label={t.lastName}><input className="qz-input" value={d.last_name} onChange={(e) => set({ last_name: e.target.value })} /></Field>
              </Row>
              <Row>
                <Field label={t.age}><input className="qz-input" type="number" inputMode="numeric" value={d.age} onChange={(e) => set({ age: e.target.value })} /></Field>
                <Field label={t.city}><input className="qz-input" value={d.city} onChange={(e) => set({ city: e.target.value })} /></Field>
              </Row>
              <Field label={t.gender}><Select value={d.gender} onChange={(v) => set({ gender: v })} options={GENDERS} labels={t.genderLabels} /></Field>
              <Row>
                <Field label={t.height}><input className="qz-input" type="number" inputMode="numeric" value={d.height_cm} onChange={(e) => set({ height_cm: e.target.value })} /></Field>
                <Field label={t.currentWeight}><input className="qz-input" type="number" inputMode="decimal" value={d.start_weight_kg} onChange={(e) => set({ start_weight_kg: e.target.value })} /></Field>
              </Row>
              <Field label={t.goalWeight}><input className="qz-input" type="number" inputMode="decimal" value={d.goal_weight_kg} onChange={(e) => set({ goal_weight_kg: e.target.value })} /></Field>
            </section>

            <section className="pe-step" style={{ display: showStep1 ? "block" : "none" }}>
              <div className="pe-sec"><HeartPulse size={17} /> {t.planSection}</div>
              <Field label={t.activity}><Select value={d.activity_level} onChange={(v) => set({ activity_level: v })} options={ACTIVITIES} labels={t.activityLabels} /></Field>
              <Field label={t.medication}><Select value={d.glp1_medication} onChange={(v) => set({ glp1_medication: v })} options={MEDS} labels={t.medLabels} /></Field>
              <Row>
                <Field label={t.dose}><Select value={d.glp1_dose} onChange={(v) => set({ glp1_dose: v })} options={DOSES} labels={t.doseLabels} /></Field>
                <Field label={t.frequency}><Select value={d.glp1_frequency} onChange={(v) => set({ glp1_frequency: v })} options={FREQS} labels={t.freqLabels} /></Field>
              </Row>
            </section>
          </div>

          {error && <div className="lg-err">{error}</div>}

          <div className="qz-foot" style={{ marginTop: 18 }}>
            {!isDesktop && step === 1 && (
              <button type="button" className="qz-back" onClick={() => setStep(0)} aria-label={t.back}>
                <ArrowLeft size={20} style={{ display: "block", margin: "0 auto" }} />
              </button>
            )}
            <button type="submit" className="qz-next" disabled={saving || (!isDesktop && step === 0 && !step0Valid)}>
              {!isDesktop && step === 0 ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>{t.next} <ArrowRight size={18} /></span>
              ) : saving ? t.saving : t.save}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.restartTitle}</div>
          <p className="qz-hint" style={{ margin: "4px 0 12px" }}>
            {t.restartDesc}
          </p>
          <button
            type="button"
            onClick={restart}
            style={{ width: "100%", height: 50, borderRadius: 14, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <RotateCcw size={17} /> {t.restartBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, marginBottom: 13 }}>
      <div className="lg-label">{label}</div>
      {children}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 12 }}>{children}</div>;
}
function Select({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels: Record<string, string> }) {
  return (
    <select className="qz-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ appearance: "auto" }}>
      {options.map((o) => <option key={o} value={o}>{labels[o] ?? o}</option>)}
    </select>
  );
}

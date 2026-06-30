"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hand, Cake, User, Ruler, Scale, Activity, Syringe, CalendarDays,
  Pill, Clock, Sun, Sofa, Footprints, Dumbbell, ArrowLeft, type LucideIcon,
} from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { defaultAvatar } from "@/lib/avatar";
import { useI18n, type Lang } from "@/lib/i18n";

type Data = {
  first_name: string; last_name: string; age: string; city: string; gender: string;
  height_cm: string; start_weight_kg: string; goal_weight_kg: string;
  activity_level: string; glp1_medication: string; glp1_dose: string; glp1_frequency: string;
};

const EMPTY: Data = {
  first_name: "", last_name: "", age: "", city: "", gender: "",
  height_cm: "", start_weight_kg: "", goal_weight_kg: "",
  activity_level: "", glp1_medication: "", glp1_dose: "", glp1_frequency: "",
};

// Optionen: der gespeicherte `value` bleibt der kanonische deutsche Wert
// (damit das Backend konsistent bleibt), nur das `label` wird übersetzt.
const genders = (lang: Lang): { value: string; label: string }[] => [
  { value: "Frau", label: lang === "de" ? "Frau" : "Female" },
  { value: "Mann", label: lang === "de" ? "Mann" : "Male" },
  { value: "Divers", label: lang === "de" ? "Divers" : "Diverse" },
];

const activities = (lang: Lang): { v: string; icon: LucideIcon; label: string; sub: string }[] => [
  { v: "Wenig aktiv", icon: Sofa, label: lang === "de" ? "Wenig aktiv" : "Not very active", sub: lang === "de" ? "Überwiegend sitzend" : "Mostly sitting" },
  { v: "Leicht aktiv", icon: Footprints, label: lang === "de" ? "Leicht aktiv" : "Lightly active", sub: lang === "de" ? "1–2× Bewegung/Woche" : "1–2× exercise/week" },
  { v: "Mäßig aktiv", icon: Activity, label: lang === "de" ? "Mäßig aktiv" : "Moderately active", sub: lang === "de" ? "3–4× Bewegung/Woche" : "3–4× exercise/week" },
  { v: "Sehr aktiv", icon: Dumbbell, label: lang === "de" ? "Sehr aktiv" : "Very active", sub: lang === "de" ? "5×+ Bewegung/Woche" : "5×+ exercise/week" },
];

const meds = (lang: Lang): { v: string; icon: LucideIcon; label: string }[] => [
  { v: "Ozempic", icon: Syringe, label: "Ozempic" },
  { v: "Wegovy", icon: Syringe, label: "Wegovy" },
  { v: "Mounjaro", icon: Syringe, label: "Mounjaro" },
  { v: "Saxenda", icon: Syringe, label: "Saxenda" },
  { v: "Rybelsus", icon: Pill, label: "Rybelsus" },
  { v: "Noch keins", icon: Clock, label: lang === "de" ? "Noch keins" : "None yet" },
];

const doses = (lang: Lang): { value: string; label: string }[] => [
  { value: "0,25 mg", label: "0,25 mg" },
  { value: "0,5 mg", label: "0,5 mg" },
  { value: "1,0 mg", label: "1,0 mg" },
  { value: "1,7 mg", label: "1,7 mg" },
  { value: "2,4 mg", label: "2,4 mg" },
  { value: "Andere", label: lang === "de" ? "Andere" : "Other" },
];

const freqs = (lang: Lang): { v: string; icon: LucideIcon; label: string }[] => [
  { v: "Wöchentlich", icon: CalendarDays, label: lang === "de" ? "Wöchentlich" : "Weekly" },
  { v: "Täglich", icon: Sun, label: lang === "de" ? "Täglich" : "Daily" },
];

const TOTAL = 9;

const TX = {
  de: {
    overlay: "Dein persönlicher Plan wird erstellt …",
    stepOf: (a: number, b: number) => `Schritt ${a} von ${b}`,
    back: "Zurück",
    next: "Weiter",
    finish: "Fertig & loslegen",
    saving: "Wird gespeichert …",
    genericError: "Etwas ist schiefgelaufen.",
    fallbackError: "Fehler",
    phFirstName: "Vorname",
    phLastName: "Nachname",
    phAge: "Alter",
    phCity: "Stadt",
    phHeight: "z. B. 168",
    phStartWeight: "z. B. 92",
    phGoalWeight: "z. B. 70",
    currentDose: "Aktuelle Dosis",
    frequency: "Häufigkeit",
    q0: "Wie heißt du?", h0: "Damit wir dich persönlich begrüßen können.",
    q1: "Dein Alter & Wohnort", h1: "Hilft uns, deine Werte richtig einzuordnen.",
    q2: "Dein Geschlecht", h2: "Wir wählen dafür ein passendes Profilbild – ändern kannst du es später jederzeit.",
    q3: "Wie groß bist du?", h3: "In Zentimetern.",
    q4: "Dein aktuelles Gewicht", h4: "In Kilogramm.",
    q5: "Dein Wunschgewicht", h5: "Dein Ziel in Kilogramm.",
    q6: "Wie aktiv bist du?", h6: "Wähle, was am besten passt.",
    q7: "Dein GLP-1 Medikament", h7: "Welches Präparat nutzt du (oder planst du)?",
    q8: "Dosis & Häufigkeit", h8: "So planen wir deinen Behandlungsplan.",
  },
  en: {
    overlay: "Your personal plan is being created …",
    stepOf: (a: number, b: number) => `Step ${a} of ${b}`,
    back: "Back",
    next: "Continue",
    finish: "Done & let's go",
    saving: "Saving …",
    genericError: "Something went wrong.",
    fallbackError: "Error",
    phFirstName: "First name",
    phLastName: "Last name",
    phAge: "Age",
    phCity: "City",
    phHeight: "e.g. 168",
    phStartWeight: "e.g. 92",
    phGoalWeight: "e.g. 70",
    currentDose: "Current dose",
    frequency: "Frequency",
    q0: "What's your name?", h0: "So we can greet you personally.",
    q1: "Your age & where you live", h1: "Helps us put your numbers in context.",
    q2: "Your gender", h2: "We'll pick a matching profile picture for it – you can change it anytime later.",
    q3: "How tall are you?", h3: "In centimeters.",
    q4: "Your current weight", h4: "In kilograms.",
    q5: "Your goal weight", h5: "Your target in kilograms.",
    q6: "How active are you?", h6: "Pick what fits best.",
    q7: "Your GLP-1 medication", h7: "Which one are you using (or planning to)?",
    q8: "Dose & frequency", h8: "This is how we plan your treatment.",
  },
} as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<Data>) => setD((p) => ({ ...p, ...patch }));

  function canNext(): boolean {
    switch (step) {
      case 0: return d.first_name.trim().length > 0 && d.last_name.trim().length > 0;
      case 1: return Number(d.age) > 0 && d.city.trim().length > 0;
      case 2: return !!d.gender;
      case 3: return Number(d.height_cm) > 0;
      case 4: return Number(d.start_weight_kg) > 0;
      case 5: return Number(d.goal_weight_kg) > 0;
      case 6: return !!d.activity_level;
      case 7: return !!d.glp1_medication;
      case 8: return !!d.glp1_dose && !!d.glp1_frequency;
      default: return false;
    }
  }

  async function finish() {
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

  function next() {
    if (!canNext()) return;
    if (step === TOTAL - 1) finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="quiz">
      {saving && <LoadingOverlay text={t.overlay} image="/mascote/fluflysearch.png" />}
      <div className="qz-inner">
        <div className="qz-prog"><i style={{ width: `${((step + 1) / TOTAL) * 100}%` }} /></div>
        <div className="qz-step">{t.stepOf(step + 1, TOTAL)}</div>

        <div className="qz-body">
          {step === 0 && (
            <Step icon={Hand} animate q={t.q0} hint={t.h0}>
              <input className="qz-input" placeholder={t.phFirstName} value={d.first_name} onChange={(e) => set({ first_name: e.target.value })} autoFocus />
              <div style={{ height: 12 }} />
              <input className="qz-input" placeholder={t.phLastName} value={d.last_name} onChange={(e) => set({ last_name: e.target.value })} />
            </Step>
          )}

          {step === 1 && (
            <Step icon={Cake} q={t.q1} hint={t.h1}>
              <div className="qz-row">
                <input className="qz-input" type="number" inputMode="numeric" placeholder={t.phAge} value={d.age} onChange={(e) => set({ age: e.target.value })} autoFocus />
                <input className="qz-input" placeholder={t.phCity} value={d.city} onChange={(e) => set({ city: e.target.value })} />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              icon={User}
              avatar={d.gender === "Mann" || d.gender === "Frau" ? defaultAvatar(d.gender, Number(d.age)) ?? undefined : undefined}
              q={t.q2}
              hint={t.h2}
            >
              <Options options={genders(lang).map((g) => ({ value: g.value, label: g.label }))} selected={d.gender} onSelect={(v) => set({ gender: v })} />
            </Step>
          )}

          {step === 3 && (
            <Step icon={Ruler} q={t.q3} hint={t.h3}>
              <Unit suffix="cm"><input className="qz-input" type="number" inputMode="numeric" placeholder={t.phHeight} value={d.height_cm} onChange={(e) => set({ height_cm: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 4 && (
            <Step icon={Scale} q={t.q4} hint={t.h4}>
              <Unit suffix="kg"><input className="qz-input" type="number" inputMode="decimal" placeholder={t.phStartWeight} value={d.start_weight_kg} onChange={(e) => set({ start_weight_kg: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 5 && (
            <Step image="/mascote/foguete1.png" q={t.q5} hint={t.h5}>
              <Unit suffix="kg"><input className="qz-input" type="number" inputMode="decimal" placeholder={t.phGoalWeight} value={d.goal_weight_kg} onChange={(e) => set({ goal_weight_kg: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 6 && (
            <Step icon={Activity} q={t.q6} hint={t.h6}>
              <Options
                options={activities(lang).map((a) => ({ value: a.v, label: a.label, icon: <a.icon size={20} />, sub: a.sub }))}
                selected={d.activity_level}
                onSelect={(v) => set({ activity_level: v })}
              />
            </Step>
          )}

          {step === 7 && (
            <Step icon={Syringe} q={t.q7} hint={t.h7}>
              <Options
                options={meds(lang).map((m) => ({ value: m.v, label: m.label, icon: <m.icon size={20} /> }))}
                selected={d.glp1_medication}
                onSelect={(v) => set({ glp1_medication: v })}
              />
            </Step>
          )}

          {step === 8 && (
            <Step icon={CalendarDays} q={t.q8} hint={t.h8}>
              <div className="qz-step" style={{ marginBottom: 8 }}>{t.currentDose}</div>
              <Options options={doses(lang).map((dose) => ({ value: dose.value, label: dose.label }))} selected={d.glp1_dose} onSelect={(v) => set({ glp1_dose: v })} compact />
              <div className="qz-step" style={{ margin: "18px 0 8px" }}>{t.frequency}</div>
              <Options options={freqs(lang).map((f) => ({ value: f.v, label: f.label, icon: <f.icon size={20} /> }))} selected={d.glp1_frequency} onSelect={(v) => set({ glp1_frequency: v })} />
            </Step>
          )}

          {error && <div className="lg-err" style={{ marginTop: 14 }}>{error}</div>}
        </div>

        <div className="qz-foot">
          {step > 0 && (
            <button className="qz-back" onClick={() => setStep((s) => s - 1)} aria-label={t.back}>
              <ArrowLeft size={20} style={{ display: "block", margin: "0 auto" }} />
            </button>
          )}
          <button className="qz-next" onClick={next} disabled={!canNext() || saving}>
            {step === TOTAL - 1 ? (saving ? t.saving : t.finish) : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ icon: I, image, avatar, q, hint, children, animate }: { icon?: LucideIcon; image?: string; avatar?: string; q: string; hint: string; children: React.ReactNode; animate?: boolean }) {
  return (
    <div>
      {avatar ? (
        <div className="qz-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={avatar} src={avatar} alt="" />
        </div>
      ) : image ? (
        <div className="qz-ico-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="qz-float-img" />
        </div>
      ) : I ? (
        <div className={`qz-ico${animate ? " wave" : ""}`}><I size={30} /></div>
      ) : null}
      <h2 className="qz-q">{q}</h2>
      <p className="qz-hint">{hint}</p>
      {children}
    </div>
  );
}

function Unit({ suffix, children }: { suffix: string; children: React.ReactNode }) {
  return (
    <div className="qz-unit">
      <div style={{ flex: 1 }}>{children}</div>
      <span>{suffix}</span>
    </div>
  );
}

function Options({
  options, selected, onSelect, compact,
}: {
  options: { value: string; label?: string; icon?: React.ReactNode; sub?: string }[];
  selected: string;
  onSelect: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="qz-opts" style={compact ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } : undefined}>
      {options.map((o) => (
        <button key={o.value} type="button" className={`qz-opt${selected === o.value ? " sel" : ""}`} onClick={() => onSelect(o.value)}>
          {o.icon && <span className="qz-emo">{o.icon}</span>}
          <span style={{ flex: 1 }}>
            {o.label ?? o.value}
            {o.sub && <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "var(--muted)" }}>{o.sub}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

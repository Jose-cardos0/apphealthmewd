"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Data = {
  first_name: string;
  last_name: string;
  age: string;
  city: string;
  gender: string;
  height_cm: string;
  start_weight_kg: string;
  goal_weight_kg: string;
  activity_level: string;
  glp1_medication: string;
  glp1_dose: string;
  glp1_frequency: string;
};

const EMPTY: Data = {
  first_name: "", last_name: "", age: "", city: "", gender: "",
  height_cm: "", start_weight_kg: "", goal_weight_kg: "",
  activity_level: "", glp1_medication: "", glp1_dose: "", glp1_frequency: "",
};

const GENDERS = [
  { v: "Frau", emo: "👩" },
  { v: "Mann", emo: "👨" },
  { v: "Divers", emo: "🧑" },
];
const ACTIVITIES = [
  { v: "Wenig aktiv", emo: "🛋️", sub: "Überwiegend sitzend" },
  { v: "Leicht aktiv", emo: "🚶‍♀️", sub: "1–2× Bewegung/Woche" },
  { v: "Mäßig aktiv", emo: "🏃‍♀️", sub: "3–4× Bewegung/Woche" },
  { v: "Sehr aktiv", emo: "💪", sub: "5×+ Bewegung/Woche" },
];
const MEDS = [
  { v: "Ozempic", emo: "💉" },
  { v: "Wegovy", emo: "💉" },
  { v: "Mounjaro", emo: "💉" },
  { v: "Saxenda", emo: "💉" },
  { v: "Rybelsus", emo: "💊" },
  { v: "Noch keins", emo: "⏳" },
];
const DOSES = ["0,25 mg", "0,5 mg", "1,0 mg", "1,7 mg", "2,4 mg", "Andere"];
const FREQS = [
  { v: "Wöchentlich", emo: "📅" },
  { v: "Täglich", emo: "☀️" },
];

const TOTAL = 9;

export default function OnboardingPage() {
  const router = useRouter();
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
        body: JSON.stringify(d),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      router.replace("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
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
      <div className="qz-inner">
        <div className="qz-prog">
          <i style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>
        <div className="qz-step">Schritt {step + 1} von {TOTAL}</div>

        <div className="qz-body">
          {step === 0 && (
            <Step emoji="👋" q="Wie heißt du?" hint="Damit wir dich persönlich begrüßen können.">
              <input className="qz-input" placeholder="Vorname" value={d.first_name} onChange={(e) => set({ first_name: e.target.value })} autoFocus />
              <div style={{ height: 12 }} />
              <input className="qz-input" placeholder="Nachname" value={d.last_name} onChange={(e) => set({ last_name: e.target.value })} />
            </Step>
          )}

          {step === 1 && (
            <Step emoji="🎂" q="Dein Alter & Wohnort" hint="Hilft uns, deine Werte richtig einzuordnen.">
              <div className="qz-row">
                <input className="qz-input" type="number" inputMode="numeric" placeholder="Alter" value={d.age} onChange={(e) => set({ age: e.target.value })} autoFocus />
                <input className="qz-input" placeholder="Stadt" value={d.city} onChange={(e) => set({ city: e.target.value })} />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step emoji="🧑" q="Dein Geschlecht" hint="Für eine genauere Berechnung deiner Werte.">
              <Options options={GENDERS.map((g) => ({ value: g.v, emo: g.emo }))} selected={d.gender} onSelect={(v) => set({ gender: v })} />
            </Step>
          )}

          {step === 3 && (
            <Step emoji="📏" q="Wie groß bist du?" hint="In Zentimetern.">
              <Unit suffix="cm"><input className="qz-input" type="number" inputMode="numeric" placeholder="z. B. 168" value={d.height_cm} onChange={(e) => set({ height_cm: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 4 && (
            <Step emoji="⚖️" q="Dein aktuelles Gewicht" hint="In Kilogramm.">
              <Unit suffix="kg"><input className="qz-input" type="number" inputMode="decimal" placeholder="z. B. 92" value={d.start_weight_kg} onChange={(e) => set({ start_weight_kg: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 5 && (
            <Step emoji="🎯" q="Dein Wunschgewicht" hint="Dein Ziel in Kilogramm.">
              <Unit suffix="kg"><input className="qz-input" type="number" inputMode="decimal" placeholder="z. B. 70" value={d.goal_weight_kg} onChange={(e) => set({ goal_weight_kg: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 6 && (
            <Step emoji="🏃‍♀️" q="Wie aktiv bist du?" hint="Wähle, was am besten passt.">
              <Options options={ACTIVITIES.map((a) => ({ value: a.v, emo: a.emo, sub: a.sub }))} selected={d.activity_level} onSelect={(v) => set({ activity_level: v })} />
            </Step>
          )}

          {step === 7 && (
            <Step emoji="💉" q="Dein GLP-1 Medikament" hint="Welches Präparat nutzt du (oder planst du)?">
              <Options options={MEDS.map((m) => ({ value: m.v, emo: m.emo }))} selected={d.glp1_medication} onSelect={(v) => set({ glp1_medication: v })} />
            </Step>
          )}

          {step === 8 && (
            <Step emoji="🗓️" q="Dosis & Häufigkeit" hint="So planen wir deinen Behandlungsplan.">
              <div className="qz-step" style={{ marginBottom: 8 }}>Aktuelle Dosis</div>
              <Options options={DOSES.map((v) => ({ value: v }))} selected={d.glp1_dose} onSelect={(v) => set({ glp1_dose: v })} compact />
              <div className="qz-step" style={{ margin: "18px 0 8px" }}>Häufigkeit</div>
              <Options options={FREQS.map((f) => ({ value: f.v, emo: f.emo }))} selected={d.glp1_frequency} onSelect={(v) => set({ glp1_frequency: v })} />
            </Step>
          )}

          {error && <div className="lg-err" style={{ marginTop: 14 }}>{error}</div>}
        </div>

        <div className="qz-foot">
          {step > 0 && (
            <button className="qz-back" onClick={() => setStep((s) => s - 1)} aria-label="Zurück">←</button>
          )}
          <button className="qz-next" onClick={next} disabled={!canNext() || saving}>
            {step === TOTAL - 1 ? (saving ? "Wird gespeichert …" : "Fertig & loslegen") : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ emoji, q, hint, children }: { emoji: string; q: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="qz-emoji">{emoji}</div>
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
  options,
  selected,
  onSelect,
  compact,
}: {
  options: { value: string; emo?: string; sub?: string }[];
  selected: string;
  onSelect: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="qz-opts" style={compact ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } : undefined}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`qz-opt${selected === o.value ? " sel" : ""}`}
          onClick={() => onSelect(o.value)}
        >
          {o.emo && <span className="qz-emo">{o.emo}</span>}
          <span style={{ flex: 1 }}>
            {o.value}
            {o.sub && <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "var(--muted)" }}>{o.sub}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

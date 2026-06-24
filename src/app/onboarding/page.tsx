"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hand, Cake, User, Ruler, Scale, Activity, Syringe, CalendarDays,
  Pill, Clock, Sun, Sofa, Footprints, Dumbbell, ArrowLeft, type LucideIcon,
} from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { defaultAvatar } from "@/lib/avatar";

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

const GENDERS = ["Frau", "Mann", "Divers"];
const ACTIVITIES: { v: string; icon: LucideIcon; sub: string }[] = [
  { v: "Wenig aktiv", icon: Sofa, sub: "Überwiegend sitzend" },
  { v: "Leicht aktiv", icon: Footprints, sub: "1–2× Bewegung/Woche" },
  { v: "Mäßig aktiv", icon: Activity, sub: "3–4× Bewegung/Woche" },
  { v: "Sehr aktiv", icon: Dumbbell, sub: "5×+ Bewegung/Woche" },
];
const MEDS: { v: string; icon: LucideIcon }[] = [
  { v: "Ozempic", icon: Syringe },
  { v: "Wegovy", icon: Syringe },
  { v: "Mounjaro", icon: Syringe },
  { v: "Saxenda", icon: Syringe },
  { v: "Rybelsus", icon: Pill },
  { v: "Noch keins", icon: Clock },
];
const DOSES = ["0,25 mg", "0,5 mg", "1,0 mg", "1,7 mg", "2,4 mg", "Andere"];
const FREQS: { v: string; icon: LucideIcon }[] = [
  { v: "Wöchentlich", icon: CalendarDays },
  { v: "Täglich", icon: Sun },
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
      {saving && <LoadingOverlay text="Dein persönlicher Plan wird erstellt …" />}
      <div className="qz-inner">
        <div className="qz-prog"><i style={{ width: `${((step + 1) / TOTAL) * 100}%` }} /></div>
        <div className="qz-step">Schritt {step + 1} von {TOTAL}</div>

        <div className="qz-body">
          {step === 0 && (
            <Step icon={Hand} animate q="Wie heißt du?" hint="Damit wir dich persönlich begrüßen können.">
              <input className="qz-input" placeholder="Vorname" value={d.first_name} onChange={(e) => set({ first_name: e.target.value })} autoFocus />
              <div style={{ height: 12 }} />
              <input className="qz-input" placeholder="Nachname" value={d.last_name} onChange={(e) => set({ last_name: e.target.value })} />
            </Step>
          )}

          {step === 1 && (
            <Step icon={Cake} q="Dein Alter & Wohnort" hint="Hilft uns, deine Werte richtig einzuordnen.">
              <div className="qz-row">
                <input className="qz-input" type="number" inputMode="numeric" placeholder="Alter" value={d.age} onChange={(e) => set({ age: e.target.value })} autoFocus />
                <input className="qz-input" placeholder="Stadt" value={d.city} onChange={(e) => set({ city: e.target.value })} />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step icon={User} q="Dein Geschlecht" hint="Wir wählen dafür ein passendes Profilbild – ändern kannst du es später jederzeit.">
              {(d.gender === "Mann" || d.gender === "Frau") && (
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={defaultAvatar(d.gender, Number(d.age)) ?? ""} alt="" style={{ width: 124, height: 124, borderRadius: "50%", objectFit: "cover", boxShadow: "0 10px 24px rgba(0,0,0,0.14)" }} />
                </div>
              )}
              <Options options={GENDERS.map((v) => ({ value: v }))} selected={d.gender} onSelect={(v) => set({ gender: v })} />
            </Step>
          )}

          {step === 3 && (
            <Step icon={Ruler} q="Wie groß bist du?" hint="In Zentimetern.">
              <Unit suffix="cm"><input className="qz-input" type="number" inputMode="numeric" placeholder="z. B. 168" value={d.height_cm} onChange={(e) => set({ height_cm: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 4 && (
            <Step icon={Scale} q="Dein aktuelles Gewicht" hint="In Kilogramm.">
              <Unit suffix="kg"><input className="qz-input" type="number" inputMode="decimal" placeholder="z. B. 92" value={d.start_weight_kg} onChange={(e) => set({ start_weight_kg: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 5 && (
            <Step image="/mascote/foguete1.png" q="Dein Wunschgewicht" hint="Dein Ziel in Kilogramm.">
              <Unit suffix="kg"><input className="qz-input" type="number" inputMode="decimal" placeholder="z. B. 70" value={d.goal_weight_kg} onChange={(e) => set({ goal_weight_kg: e.target.value })} autoFocus /></Unit>
            </Step>
          )}

          {step === 6 && (
            <Step icon={Activity} q="Wie aktiv bist du?" hint="Wähle, was am besten passt.">
              <Options
                options={ACTIVITIES.map((a) => ({ value: a.v, icon: <a.icon size={20} />, sub: a.sub }))}
                selected={d.activity_level}
                onSelect={(v) => set({ activity_level: v })}
              />
            </Step>
          )}

          {step === 7 && (
            <Step icon={Syringe} q="Dein GLP-1 Medikament" hint="Welches Präparat nutzt du (oder planst du)?">
              <Options
                options={MEDS.map((m) => ({ value: m.v, icon: <m.icon size={20} /> }))}
                selected={d.glp1_medication}
                onSelect={(v) => set({ glp1_medication: v })}
              />
            </Step>
          )}

          {step === 8 && (
            <Step icon={CalendarDays} q="Dosis & Häufigkeit" hint="So planen wir deinen Behandlungsplan.">
              <div className="qz-step" style={{ marginBottom: 8 }}>Aktuelle Dosis</div>
              <Options options={DOSES.map((v) => ({ value: v }))} selected={d.glp1_dose} onSelect={(v) => set({ glp1_dose: v })} compact />
              <div className="qz-step" style={{ margin: "18px 0 8px" }}>Häufigkeit</div>
              <Options options={FREQS.map((f) => ({ value: f.v, icon: <f.icon size={20} /> }))} selected={d.glp1_frequency} onSelect={(v) => set({ glp1_frequency: v })} />
            </Step>
          )}

          {error && <div className="lg-err" style={{ marginTop: 14 }}>{error}</div>}
        </div>

        <div className="qz-foot">
          {step > 0 && (
            <button className="qz-back" onClick={() => setStep((s) => s - 1)} aria-label="Zurück">
              <ArrowLeft size={20} style={{ display: "block", margin: "0 auto" }} />
            </button>
          )}
          <button className="qz-next" onClick={next} disabled={!canNext() || saving}>
            {step === TOTAL - 1 ? (saving ? "Wird gespeichert …" : "Fertig & loslegen") : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ icon: I, image, q, hint, children, animate }: { icon?: LucideIcon; image?: string; q: string; hint: string; children: React.ReactNode; animate?: boolean }) {
  return (
    <div>
      {image ? (
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
  options: { value: string; icon?: React.ReactNode; sub?: string }[];
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
            {o.value}
            {o.sub && <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "var(--muted)" }}>{o.sub}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

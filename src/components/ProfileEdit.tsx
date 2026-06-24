"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Profile } from "@/lib/types";

const GENDERS = ["Frau", "Mann", "Divers"];
const ACTIVITIES = ["Wenig aktiv", "Leicht aktiv", "Mäßig aktiv", "Sehr aktiv"];
const MEDS = ["Ozempic", "Wegovy", "Mounjaro", "Saxenda", "Rybelsus", "Noch keins"];
const DOSES = ["0,25 mg", "0,5 mg", "1,0 mg", "1,7 mg", "2,4 mg", "Andere"];
const FREQS = ["Wöchentlich", "Täglich"];

export default function ProfileEdit({ profile }: { profile: Profile | null }) {
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof d>) => setD((p) => ({ ...p, ...patch }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="quiz">
      <div className="qz-inner" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button className="qz-back" style={{ flex: "0 0 44px", height: 44 }} onClick={() => router.replace("/app")} aria-label="Zurück">
            <ArrowLeft size={18} style={{ display: "block", margin: "0 auto" }} />
          </button>
          <h2 className="qz-q" style={{ fontSize: 22, margin: 0 }}>Meine Daten</h2>
        </div>
        <p className="qz-hint" style={{ marginBottom: 18 }}>
          Aktualisiere deine Angaben – HealthMe berechnet deinen Plan danach neu.
        </p>

        <form onSubmit={save} style={{ overflowY: "auto", flex: 1, paddingRight: 2 }}>
          <Row>
            <Field label="Vorname"><input className="qz-input" value={d.first_name} onChange={(e) => set({ first_name: e.target.value })} /></Field>
            <Field label="Nachname"><input className="qz-input" value={d.last_name} onChange={(e) => set({ last_name: e.target.value })} /></Field>
          </Row>
          <Row>
            <Field label="Alter"><input className="qz-input" type="number" inputMode="numeric" value={d.age} onChange={(e) => set({ age: e.target.value })} /></Field>
            <Field label="Stadt"><input className="qz-input" value={d.city} onChange={(e) => set({ city: e.target.value })} /></Field>
          </Row>
          <Field label="Geschlecht"><Select value={d.gender} onChange={(v) => set({ gender: v })} options={GENDERS} /></Field>
          <Row>
            <Field label="Größe (cm)"><input className="qz-input" type="number" inputMode="numeric" value={d.height_cm} onChange={(e) => set({ height_cm: e.target.value })} /></Field>
            <Field label="Aktuelles Gewicht (kg)"><input className="qz-input" type="number" inputMode="decimal" value={d.start_weight_kg} onChange={(e) => set({ start_weight_kg: e.target.value })} /></Field>
          </Row>
          <Field label="Wunschgewicht (kg)"><input className="qz-input" type="number" inputMode="decimal" value={d.goal_weight_kg} onChange={(e) => set({ goal_weight_kg: e.target.value })} /></Field>
          <Field label="Aktivität"><Select value={d.activity_level} onChange={(v) => set({ activity_level: v })} options={ACTIVITIES} /></Field>
          <Field label="GLP-1 Medikament"><Select value={d.glp1_medication} onChange={(v) => set({ glp1_medication: v })} options={MEDS} /></Field>
          <Row>
            <Field label="Dosis"><Select value={d.glp1_dose} onChange={(v) => set({ glp1_dose: v })} options={DOSES} /></Field>
            <Field label="Häufigkeit"><Select value={d.glp1_frequency} onChange={(v) => set({ glp1_frequency: v })} options={FREQS} /></Field>
          </Row>

          {error && <div className="lg-err">{error}</div>}

          <button className="qz-next" type="submit" disabled={saving} style={{ width: "100%", marginTop: 18 }}>
            {saving ? "Wird gespeichert …" : "Speichern & Plan neu berechnen"}
          </button>
        </form>
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
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className="qz-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ appearance: "auto" }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

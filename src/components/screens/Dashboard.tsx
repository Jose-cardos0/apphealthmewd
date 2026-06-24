"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Camera, Plus, Trash2 } from "lucide-react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import { dashboardMetrics, bmiCategory, de } from "@/lib/metrics";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import { uploadAvatar } from "@/lib/uploadAvatar";
import { getDailyLog, saveDailyLog, listDoses, addDose, removeDose, todayStr, type Dose } from "@/lib/logs";
import type { Profile } from "@/lib/types";

const MEDS = ["Ozempic", "Wegovy", "Mounjaro", "Saxenda", "Rybelsus"];
const DOSES = ["0,25 mg", "0,5 mg", "1,0 mg", "1,7 mg", "2,4 mg"];

export default function Dashboard({
  active,
  profile,
  onScan,
}: {
  active: boolean;
  profile: Profile | null;
  onScan: () => void;
}) {
  const router = useRouter();
  const m = dashboardMetrics(profile);
  const cat = bmiCategory(m.bmi);
  const firstName = profile?.first_name || "willkommen";
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Mein Profil";
  const sub = [profile?.age ? `${profile.age} Jahre` : null, profile?.city].filter(Boolean).join(" · ");

  const med = profile?.glp1_medication && profile.glp1_medication !== "Noch keins" ? profile.glp1_medication : null;
  const profDose = profile?.glp1_dose || "0,25 mg";
  const freq = profile?.glp1_frequency || "Wöchentlich";

  const kcalGoal = profile?.plan?.daily_kcal ?? kcalTargetNum(profile);
  const waterGoalL = profile?.plan?.water_liters ?? 2.5;

  // Tagesprotokoll + Dosen
  const [water, setWater] = useState(0);
  const [kcal, setKcal] = useState(0);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [modal, setModal] = useState<null | "water" | "kcal" | "dose">(null);
  const [kcalInput, setKcalInput] = useState("");
  const [doseForm, setDoseForm] = useState({ medication: med ?? "Ozempic", dose: profDose, taken_on: todayStr() });

  const reload = useCallback(async () => {
    try {
      const [log, ds] = await Promise.all([getDailyLog(), listDoses()]);
      setWater(log.water_ml);
      setKcal(log.kcal);
      setDoses(ds);
    } catch {
      /* offline / nicht eingeloggt */
    }
  }, []);

  useEffect(() => {
    if (active) reload();
  }, [active, reload]);

  // Fortschrittsbalken animieren
  const [trackW, setTrackW] = useState(0);
  const filled = useRef(false);
  useEffect(() => {
    if (active && !filled.current) {
      filled.current = true;
      setTimeout(() => setTrackW(m.progressPct), 250);
    }
  }, [active, m.progressPct]);

  // Avatar-Upload
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const avSrc = avatarOverride ?? avatarSrc(profile);
  const initials = avatarInitials(profile);

  async function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarOverride(url);
      router.refresh();
    } catch {
      /* ignoriert */
    } finally {
      setUploading(false);
    }
  }

  async function changeWater(deltaMl: number) {
    const next = Math.max(0, water + deltaMl);
    setWater(next);
    try { await saveDailyLog(next, kcal); } catch { /* ignoriert */ }
  }

  async function submitKcal() {
    const add = Math.round(parseFloat(kcalInput.replace(",", ".")) || 0);
    if (add <= 0) { setModal(null); return; }
    const next = kcal + add;
    setKcal(next);
    setKcalInput("");
    setModal(null);
    try { await saveDailyLog(water, next); } catch { /* ignoriert */ }
  }

  async function submitDose() {
    setModal(null);
    try {
      const row = await addDose(doseForm);
      setDoses((p) => [row, ...p]);
    } catch { /* ignoriert */ }
  }

  async function deleteDose(id: string) {
    setDoses((p) => p.filter((x) => x.id !== id));
    try { await removeDose(id); } catch { /* ignoriert */ }
  }

  const waterL = water / 1000;

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-dashboard">
      <div className="scr-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="muted" style={{ fontSize: 13 }}>Willkommen zurück</div>
          <h1 className="t">Hallo, {firstName}</h1>
        </div>
        <button className="bell" aria-label="Benachrichtigungen">
          <Icon name="ic-bell" />
          <span className="bdot">3</span>
        </button>
      </div>

      <div className="scr-body">
        <div className="hero">
          <div className="info">
            <div className="name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {fullName}
              <button
                onClick={() => router.push("/profil")}
                aria-label="Daten bearbeiten"
                title="Daten bearbeiten"
                style={{ border: "none", background: "#f5eed9", color: "var(--accent2)", width: 28, height: 28, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <Pencil size={15} />
              </button>
            </div>
            {sub && <div className="sub">{sub}</div>}
            {m.goalDiff > 0 && (
              <span className="pill" style={{ marginTop: 8 }}>
                <Icon name="ic-target" /> Ziel: {de(m.goalDiff, 0)}&nbsp;kg abnehmen
              </span>
            )}
            {m.start != null && m.goal != null && (
              <div className="goal">
                <div className="nums" style={{ marginTop: 10 }}>
                  <b>{de(m.current ?? m.start)}&nbsp;kg</b>
                  <span className="arrow"><Icon name="ic-chev" style={{ width: 18, height: 18 }} /></span>
                  <b>{de(m.goal)}&nbsp;kg</b>
                </div>
                <div className="track"><i style={{ width: `${trackW}%` }} /></div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 5 }}>
                  {de(m.lost)}&nbsp;kg geschafft · noch {de(m.toGo)}&nbsp;kg
                </div>
              </div>
            )}
          </div>
          <div className="av-edit" onClick={() => avatarInput.current?.click()} title="Foto ändern">
            <input ref={avatarInput} type="file" accept="image/*" style={{ display: "none" }} onChange={onAvatarFile} />
            {avSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ava" src={avSrc} alt="" />
            ) : (
              <span className="ava-initials">{initials}</span>
            )}
            <span className="av-cam">{uploading ? <span className="av-spin" /> : <Camera size={14} />}</span>
          </div>
        </div>

        <div className="grid2">
          <div className="stat">
            <div className="h"><span className="ic" style={{ background: "#fde2e1", color: "#e0484b" }}><Icon name="ic-body" style={{ width: 16 }} /></span> BMI</div>
            <div className="v">{m.bmi != null ? de(m.bmi) : "—"}</div>
            <span className={`tag ${cat.tag}`}>{cat.label}</span>
          </div>

          <div className="stat">
            <button className="stat-add" onClick={() => setModal("kcal")} aria-label="Kalorien hinzufügen"><Plus size={17} /></button>
            <div className="h"><span className="ic" style={{ background: "#fde2e1", color: "#ff6b3d" }}><Icon name="ic-flame" style={{ width: 16 }} /></span> Kalorien heute</div>
            <div className="v">{kcal.toLocaleString("de-DE")} <small>/ {kcalGoal.toLocaleString("de-DE")}</small></div>
          </div>

          <div className="stat">
            <button className="stat-add" onClick={() => setModal("water")} aria-label="Wasser hinzufügen"><Plus size={17} /></button>
            <div className="h"><span className="ic" style={{ background: "#d9f0fb", color: "#2b9fd6" }}><Icon name="ic-drop" style={{ width: 16 }} /></span> Wasser</div>
            <div className="v">{de(waterL, 1)} <small>/ {de(waterGoalL, 1)} L</small></div>
          </div>

          <div className="stat">
            <div className="h"><span className="ic" style={{ background: "#f5eed9", color: "var(--accent2)" }}><Icon name="ic-spark" style={{ width: 16 }} /></span> Dosen</div>
            <div className="v">{doses.length} <small>gesamt</small></div>
          </div>
        </div>

        <div className="sec-title">
          <span className="h">Dein Behandlungsplan</span>
          <button className="more" onClick={() => { setDoseForm({ medication: med ?? "Ozempic", dose: profDose, taken_on: todayStr() }); setModal("dose"); }} style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Plus size={15} /> Dosis
          </button>
        </div>
        <div className="card">
          {med && (
            <div className="dose next">
              <span className="di"><Icon name="ic-syringe" /></span>
              <div className="dinfo">
                <div className="dn">Nächste Dosis · {med}</div>
                <div className="dd">{freq} · {profDose}</div>
              </div>
              <span className="pill">Bereit</span>
            </div>
          )}

          {doses.map((d) => (
            <div className="dose done" key={d.id}>
              <span className="di"><Icon name="ic-check-c" /></span>
              <div className="dinfo">
                <div className="dn">{d.medication || "Dosis"} · {d.dose || ""}</div>
                <div className="dd">genommen am {formatDate(d.taken_on)}</div>
              </div>
              <button onClick={() => deleteDose(d.id)} aria-label="Löschen" style={{ border: "none", background: "none", color: "#c6bca2", cursor: "pointer", flexShrink: 0 }}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}

          {!med && doses.length === 0 && (
            <div className="dose next">
              <span className="di"><Icon name="ic-syringe" /></span>
              <div className="dinfo">
                <div className="dn">Noch keine Dosis eingetragen</div>
                <div className="dd">Tippe oben auf „+ Dosis“, um deine erste Injektion zu protokollieren.</div>
              </div>
            </div>
          )}
        </div>

        {profile?.plan?.tips && profile.plan.tips.length > 0 && (
          <>
            <div className="sec-title">
              <span className="h">Tipps für dich</span>
              <span className="more">von HealthMe KI</span>
            </div>
            <div className="card">
              {profile.plan.motivation && (
                <p style={{ margin: "0 0 12px", fontSize: 14.5, fontWeight: 700, color: "var(--accent2)" }}>{profile.plan.motivation}</p>
              )}
              {profile.plan.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 11, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                  <span style={{ flexShrink: 0, color: "var(--accent2)", marginTop: 1 }}><Icon name="ic-check-c" /></span>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={onScan} className="card" style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(140deg,#fff,#fbf6ea)" }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(140deg,#e8ce78,var(--accent2))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="ic-camai" style={{ width: 22, height: 22 }} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontWeight: 800, fontSize: 14.5 }}>Mahlzeit scannen</span>
            <span className="muted" style={{ fontSize: 12 }}>Kalorien & Nährwerte in Sekunden</span>
          </span>
          <span className="muted"><Icon name="ic-chev" /></span>
        </button>
      </div>

      {/* ===== Modals ===== */}
      {modal === "water" && (
        <Modal title="Wasser hinzufügen" onClose={() => setModal(null)}>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Heute: {de(waterL, 1)} L von {de(waterGoalL, 1)} L</p>
          <div className="modal-quick">
            <button onClick={() => changeWater(250)}>+250 ml</button>
            <button onClick={() => changeWater(500)}>+500 ml</button>
            <button onClick={() => changeWater(750)}>+750 ml</button>
          </div>
          <button className="qz-next" style={{ width: "100%", marginTop: 6 }} onClick={() => setModal(null)}>Fertig</button>
          <button onClick={() => changeWater(-250)} style={{ width: "100%", marginTop: 10, border: "none", background: "none", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>−250 ml rückgängig</button>
        </Modal>
      )}

      {modal === "kcal" && (
        <Modal title="Kalorien hinzufügen" onClose={() => setModal(null)}>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Heute: {kcal.toLocaleString("de-DE")} / {kcalGoal.toLocaleString("de-DE")} kcal</p>
          <input
            className="qz-input"
            type="number"
            inputMode="numeric"
            placeholder="z. B. 450"
            value={kcalInput}
            onChange={(e) => setKcalInput(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") submitKcal(); }}
          />
          <button className="qz-next" style={{ width: "100%", marginTop: 14 }} onClick={submitKcal}>Hinzufügen</button>
        </Modal>
      )}

      {modal === "dose" && (
        <Modal title="Dosis eintragen" onClose={() => setModal(null)}>
          <div className="lg-label">Medikament</div>
          <select className="qz-input" value={doseForm.medication} onChange={(e) => setDoseForm((p) => ({ ...p, medication: e.target.value }))} style={{ appearance: "auto", marginBottom: 12 }}>
            {MEDS.map((mm) => <option key={mm}>{mm}</option>)}
          </select>
          <div className="lg-label">Dosis</div>
          <select className="qz-input" value={doseForm.dose} onChange={(e) => setDoseForm((p) => ({ ...p, dose: e.target.value }))} style={{ appearance: "auto", marginBottom: 12 }}>
            {DOSES.map((dd) => <option key={dd}>{dd}</option>)}
          </select>
          <div className="lg-label">Datum</div>
          <input className="qz-input" type="date" value={doseForm.taken_on} onChange={(e) => setDoseForm((p) => ({ ...p, taken_on: e.target.value }))} style={{ marginBottom: 4 }} />
          <button className="qz-next" style={{ width: "100%", marginTop: 14 }} onClick={submitDose}>Eintragen</button>
        </Modal>
      )}
    </section>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

function kcalTargetNum(p: Profile | null): number {
  if (!p?.current_weight_kg || !p?.height_cm || !p?.age) return 1800;
  const w = p.current_weight_kg, h = p.height_cm, a = p.age;
  const base = p.gender === "Mann" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  return Math.round((base * 1.3 - 400) / 10) * 10;
}

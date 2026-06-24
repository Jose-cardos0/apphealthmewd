"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Camera } from "lucide-react";
import Icon from "@/components/Icon";
import { dashboardMetrics, bmiCategory, de } from "@/lib/metrics";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import { uploadAvatar } from "@/lib/uploadAvatar";
import type { Profile } from "@/lib/types";

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

  const [trackW, setTrackW] = useState(0);
  const filled = useRef(false);
  useEffect(() => {
    if (active && !filled.current) {
      filled.current = true;
      setTimeout(() => setTrackW(m.progressPct), 250);
    }
  }, [active, m.progressPct]);

  const med = profile?.glp1_medication && profile.glp1_medication !== "Noch keins" ? profile.glp1_medication : null;
  const dose = profile?.glp1_dose || "0,25 mg";
  const freq = profile?.glp1_frequency || "Wöchentlich";

  // Werte aus dem Grok-Plan (Fallback: lokale Schätzung)
  const kcalText = profile?.plan?.daily_kcal != null ? profile.plan.daily_kcal.toLocaleString("de-DE") : kcalTarget(profile);
  const waterText = de(profile?.plan?.water_liters ?? 2.5, 1);

  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const src = avatarOverride ?? avatarSrc(profile);
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
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ava" src={src} alt="" />
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
            <div className="h"><span className="ic" style={{ background: "#fde2e1", color: "#ff6b3d" }}><Icon name="ic-flame" style={{ width: 16 }} /></span> Kalorien heute</div>
            <div className="v">0 <small>/ {kcalText}</small></div>
          </div>
          <div className="stat">
            <div className="h"><span className="ic" style={{ background: "#d9f0fb", color: "#2b9fd6" }}><Icon name="ic-drop" style={{ width: 16 }} /></span> Wasser</div>
            <div className="v">0,0 <small>/ {waterText} L</small></div>
          </div>
          <div className="stat">
            <div className="h"><span className="ic" style={{ background: "#f5eed9", color: "var(--accent2)" }}><Icon name="ic-spark" style={{ width: 16 }} /></span> Streak</div>
            <div className="v">1 <small>Tag</small></div>
          </div>
        </div>

        <div className="sec-title">
          <span className="h">Dein Behandlungsplan</span>
          <span className="more">{med ? `GLP-1 · ${freq.toLowerCase()}` : "GLP-1"}</span>
        </div>
        <div className="card">
          {med ? (
            <>
              <div className="dose next">
                <span className="di"><Icon name="ic-syringe" /></span>
                <div className="dinfo">
                  <div className="dn">Nächste Dosis · {med}</div>
                  <div className="dd">{freq} · {dose}</div>
                </div>
                <span className="pill">Bereit</span>
              </div>
              <div className="dose future">
                <span className="di"><Icon name="ic-syringe" /></span>
                <div className="dinfo">
                  <div className="dn">Folgedosis</div>
                  <div className="dd">{freq === "Täglich" ? "morgen" : "in 7 Tagen"} · {dose}</div>
                </div>
                <span className="wait">geplant</span>
              </div>
              <div className="dose-total">
                <span className="ti"><Icon name="ic-spark" className="i fill" /></span>
                <div>
                  <div className="tt">Dein Start</div>
                  <div className="tv">Auf dem Weg zu <b>{m.goal != null ? `${de(m.goal)} kg` : "deinem Ziel"}</b></div>
                </div>
              </div>
            </>
          ) : (
            <div className="dose next">
              <span className="di"><Icon name="ic-syringe" /></span>
              <div className="dinfo">
                <div className="dn">Noch kein Medikament hinterlegt</div>
                <div className="dd">Du kannst deinen Plan jederzeit ergänzen.</div>
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
                <p style={{ margin: "0 0 12px", fontSize: 14.5, fontWeight: 700, color: "var(--accent2)" }}>
                  {profile.plan.motivation}
                </p>
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

        <button
          onClick={onScan}
          className="card"
          style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(140deg,#fff,#fbf6ea)" }}
        >
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
    </section>
  );
}

function kcalTarget(p: Profile | null): string {
  // grobe Schätzung: Mifflin-St Jeor, leichtes Defizit
  if (!p?.current_weight_kg || !p?.height_cm || !p?.age) return "1.800";
  const w = p.current_weight_kg, h = p.height_cm, a = p.age;
  const base = p.gender === "Mann" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const target = Math.round((base * 1.3 - 400) / 10) * 10;
  return target.toLocaleString("de-DE");
}

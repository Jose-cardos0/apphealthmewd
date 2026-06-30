"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Camera, Plus, Trash2, GlassWater, Milk, Flame, Dumbbell, Syringe, CheckCircle2 } from "lucide-react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Alert from "@/components/Alert";
import { dashboardMetrics, bmiCategory, de } from "@/lib/metrics";
import { avatarSrc, avatarInitials } from "@/lib/avatar";
import { uploadAvatar } from "@/lib/uploadAvatar";
import { getDailyLog, saveDailyLog, listDoses, addDose, removeDose, updateCurrentWeight, todayStr, type Dose } from "@/lib/logs";
import { getTodayBurned } from "@/lib/workouts";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const MEDS = ["Ozempic", "Wegovy", "Mounjaro", "Saxenda", "Rybelsus"];
const DOSES = ["0,25 mg", "0,5 mg", "1,0 mg", "1,7 mg", "2,4 mg"];

const TX = {
  de: {
    welcome: "willkommen",
    myProfile: "Mein Profil",
    years: (n: number) => `${n} Jahre`,
    weekly: "Wöchentlich",
    waterGoalReachedTitle: "Wasserziel erreicht",
    waterGoalReachedMsg: (drank: string, goal: string) =>
      `Stark! Du hast heute ${drank} L getrunken und dein Ziel von ${goal} L erreicht. Trink über den Tag verteilt weiter – sehr große Mengen auf einmal sind nicht nötig.`,
    kcalOverTitle: "Kalorienziel überschritten",
    kcalOverMsg: (net: string, goal: string) =>
      `Du liegst heute bei ${net} kcal (abzüglich Training) – über deinem Tagesziel von ${goal} kcal. Plane den Rest des Tages etwas leichter.`,
    notifKcalOverText: (over: string) =>
      `Du liegst ${over} kcal über deinem Tagesziel. Plane den Rest des Tages etwas leichter.`,
    notifDrinkMoreTitle: "Trink mehr Wasser",
    notifDrinkMoreText: (rest: string, goal: string) =>
      `Dir fehlen noch ${rest} L bis zu deinem Tagesziel von ${goal} L.`,
    notifDoseTitle: "GLP-1 Dosis",
    notifDoseText: "Du hast heute noch keine Dosis eingetragen.",
    notifNoWorkoutTitle: "Noch kein Training",
    notifNoWorkoutText: "Heute noch nichts trainiert – schau im Coach vorbei!",
    welcomeBack: "Willkommen zurück",
    hello: (name: string) => `Hallo, ${name}`,
    notifications: "Benachrichtigungen",
    editData: "Daten bearbeiten",
    goalLose: (kg: string) => `Ziel: ${kg} kg abnehmen`,
    updateWeight: "Gewicht aktualisieren",
    progress: (lost: string, toGo: string) => `${lost} kg geschafft · noch ${toGo} kg`,
    changePhoto: "Foto ändern",
    bmi: "BMI",
    addKcal: "Kalorien hinzufügen",
    kcalToday: "Kalorien heute",
    burnedByWorkout: (n: string) => `−${n} kcal durch Training`,
    addWater: "Wasser hinzufügen",
    water: "Wasser",
    doses: "Dosen",
    total: "gesamt",
    treatmentPlan: "Dein Behandlungsplan",
    dose: "Dosis",
    nextDose: (med: string) => `Nächste Dosis · ${med}`,
    ready: "Bereit",
    doseFallback: "Dosis",
    takenOn: (date: string) => `genommen am ${date}`,
    delete: "Löschen",
    noDoseTitle: "Noch keine Dosis eingetragen",
    noDoseText: "Tippe oben auf „+ Dosis“, um deine erste Injektion zu protokollieren.",
    tipsTitle: "Tipps für dich",
    tipsBy: "von HealthMe KI",
    scanMeal: "Mahlzeit scannen",
    scanMealSub: "Kalorien & Nährwerte in Sekunden",
    todayWater: (drank: string, goal: string) => `Heute: ${drank} L von ${goal} L`,
    done: "Fertig",
    undoWater: "−250 ml rückgängig",
    todayKcal: (kcal: string, goal: string) => `Heute: ${kcal} / ${goal} kcal`,
    kcalPlaceholder: "z. B. 450",
    add: "Hinzufügen",
    enterWeight: "Gewicht eintragen",
    startGoal: (start: string, goal: string) => `Start: ${start} kg · Ziel: ${goal} kg`,
    yourCurrentWeight: "Dein aktuelles Gewicht (kg)",
    weightPlaceholder: "z. B. 90,5",
    save: "Speichern",
    enterDose: "Dosis eintragen",
    medication: "Medikament",
    date: "Datum",
    register: "Eintragen",
    hints: "Hinweise",
    allGoodTitle: "Alles im grünen Bereich!",
    allGoodText: "Keine offenen Hinweise für heute.",
  },
  en: {
    welcome: "welcome",
    myProfile: "My profile",
    years: (n: number) => `${n} years`,
    weekly: "Weekly",
    waterGoalReachedTitle: "Water goal reached",
    waterGoalReachedMsg: (drank: string, goal: string) =>
      `Awesome! You've drunk ${drank} L today and hit your goal of ${goal} L. Keep sipping throughout the day – there's no need to down huge amounts at once.`,
    kcalOverTitle: "Calorie goal exceeded",
    kcalOverMsg: (net: string, goal: string) =>
      `You're at ${net} kcal today (after workouts) – over your daily goal of ${goal} kcal. Take it a bit lighter for the rest of the day.`,
    notifKcalOverText: (over: string) =>
      `You're ${over} kcal over your daily goal. Take it a bit lighter for the rest of the day.`,
    notifDrinkMoreTitle: "Drink more water",
    notifDrinkMoreText: (rest: string, goal: string) =>
      `You're still ${rest} L short of your daily goal of ${goal} L.`,
    notifDoseTitle: "GLP-1 dose",
    notifDoseText: "You haven't logged a dose today yet.",
    notifNoWorkoutTitle: "No workout yet",
    notifNoWorkoutText: "Nothing logged today – go check out the Coach!",
    welcomeBack: "Welcome back",
    hello: (name: string) => `Hi, ${name}`,
    notifications: "Notifications",
    editData: "Edit data",
    goalLose: (kg: string) => `Goal: lose ${kg} kg`,
    updateWeight: "Update weight",
    progress: (lost: string, toGo: string) => `${lost} kg done · ${toGo} kg to go`,
    changePhoto: "Change photo",
    bmi: "BMI",
    addKcal: "Add calories",
    kcalToday: "Calories today",
    burnedByWorkout: (n: string) => `−${n} kcal from workouts`,
    addWater: "Add water",
    water: "Water",
    doses: "Doses",
    total: "total",
    treatmentPlan: "Your treatment plan",
    dose: "Dose",
    nextDose: (med: string) => `Next dose · ${med}`,
    ready: "Ready",
    doseFallback: "Dose",
    takenOn: (date: string) => `taken on ${date}`,
    delete: "Delete",
    noDoseTitle: "No dose logged yet",
    noDoseText: "Tap „+ Dose“ above to log your first injection.",
    tipsTitle: "Tips for you",
    tipsBy: "by HealthMe AI",
    scanMeal: "Scan a meal",
    scanMealSub: "Calories & nutrients in seconds",
    todayWater: (drank: string, goal: string) => `Today: ${drank} L of ${goal} L`,
    done: "Done",
    undoWater: "−250 ml undo",
    todayKcal: (kcal: string, goal: string) => `Today: ${kcal} / ${goal} kcal`,
    kcalPlaceholder: "e.g. 450",
    add: "Add",
    enterWeight: "Enter weight",
    startGoal: (start: string, goal: string) => `Start: ${start} kg · Goal: ${goal} kg`,
    yourCurrentWeight: "Your current weight (kg)",
    weightPlaceholder: "e.g. 90.5",
    save: "Save",
    enterDose: "Log a dose",
    medication: "Medication",
    date: "Date",
    register: "Log",
    hints: "Notifications",
    allGoodTitle: "All in the green!",
    allGoodText: "No open notifications for today.",
  },
} as const;

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
  const { lang } = useI18n();
  const t = TX[lang];
  const nf = lang === "de" ? "de-DE" : "en-US";
  // Aktuelles Gewicht lokal halten, damit der Fortschritt sofort neu rechnet
  const [currentWeight, setCurrentWeight] = useState<number | null>(profile?.current_weight_kg ?? null);
  const effProfile = profile ? { ...profile, current_weight_kg: currentWeight } : null;
  const m = dashboardMetrics(effProfile);
  const cat = bmiCategory(m.bmi);
  const firstName = profile?.first_name || t.welcome;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || t.myProfile;
  const sub = [profile?.age ? t.years(profile.age) : null, profile?.city].filter(Boolean).join(" · ");

  const med = profile?.glp1_medication && profile.glp1_medication !== "Noch keins" ? profile.glp1_medication : null;
  const profDose = profile?.glp1_dose || "0,25 mg";
  const freq = profile?.glp1_frequency || t.weekly;

  const kcalGoal = profile?.plan?.daily_kcal ?? kcalTargetNum(profile);
  const waterGoalL = profile?.plan?.water_liters ?? 2.5;

  // Tagesprotokoll + Dosen
  const [water, setWater] = useState(0);
  const [kcal, setKcal] = useState(0);
  const [burned, setBurned] = useState(0);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [modal, setModal] = useState<null | "water" | "kcal" | "dose" | "weight">(null);
  const [kcalInput, setKcalInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [doseForm, setDoseForm] = useState({ medication: med ?? "Ozempic", dose: profDose, taken_on: todayStr() });
  const [flash, setFlash] = useState<{ key: number; text: string; color: string } | null>(null);
  const flashKey = useRef(0);
  const [alert, setAlert] = useState<{ title: string; message: string; tone: "warn" | "info" } | null>(null);
  const [showNotif, setShowNotif] = useState(false);

  // Motivation/Tipps in der aktuellen Sprache (KI-Text wird bei Sprachwechsel neu erzeugt)
  const [planText, setPlanText] = useState<{ motivation: string; tips: string[] } | null>(
    profile?.plan ? { motivation: profile.plan.motivation, tips: profile.plan.tips } : null,
  );
  const relangFor = useRef<string | null>(null);
  useEffect(() => {
    if (!active) return;
    const pl = profile?.plan;
    if (!pl) return;
    const planLang = pl.lang ?? "de";
    if (planLang === lang) {
      setPlanText({ motivation: pl.motivation, tips: pl.tips });
      relangFor.current = null;
      return;
    }
    if (relangFor.current === lang) return; // schon angefragt
    relangFor.current = lang;
    (async () => {
      try {
        const res = await fetch("/api/account/plan-relang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang }),
        });
        const j = await res.json();
        if (res.ok && j.plan) setPlanText({ motivation: j.plan.motivation, tips: j.plan.tips });
      } catch {
        /* offline – behält den vorhandenen Text */
      }
    })();
  }, [active, lang, profile]);

  const reload = useCallback(async () => {
    try {
      const [log, ds, b] = await Promise.all([getDailyLog(), listDoses(), getTodayBurned()]);
      setWater(log.water_ml);
      setKcal(log.kcal);
      setDoses(ds);
      setBurned(b);
    } catch {
      /* offline / nicht eingeloggt */
    }
  }, []);

  useEffect(() => {
    if (active) reload();
  }, [active, reload]);

  // Fortschrittsbalken animieren (auch neu, wenn sich das Gewicht ändert)
  const [trackW, setTrackW] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setTrackW(m.progressPct), 250);
    return () => clearTimeout(t);
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
    flashKey.current += 1;
    setFlash({
      key: flashKey.current,
      text: `${deltaMl > 0 ? "+" : "−"}${Math.abs(deltaMl)} ml`,
      color: deltaMl > 0 ? "#2b9fd6" : "#b4ab99",
    });
    const goalMl = waterGoalL * 1000;
    if (deltaMl > 0 && water <= goalMl && next > goalMl) {
      setAlert({
        title: t.waterGoalReachedTitle,
        message: t.waterGoalReachedMsg(de(next / 1000, 1), de(waterGoalL, 1)),
        tone: "info",
      });
    }
    try { await saveDailyLog(next, kcal); } catch { /* ignoriert */ }
  }

  async function submitKcal() {
    const add = Math.round(parseFloat(kcalInput.replace(",", ".")) || 0);
    if (add <= 0) { setModal(null); return; }
    const next = kcal + add;
    setKcal(next);
    setKcalInput("");
    setModal(null);
    if (kcal - burned <= kcalGoal && next - burned > kcalGoal) {
      setAlert({
        title: t.kcalOverTitle,
        message: t.kcalOverMsg((next - burned).toLocaleString(nf), kcalGoal.toLocaleString(nf)),
        tone: "warn",
      });
    }
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

  async function submitWeight() {
    const v = parseFloat(weightInput.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) { setModal(null); return; }
    setCurrentWeight(v);
    setWeightInput("");
    setModal(null);
    try { await updateCurrentWeight(v); router.refresh(); } catch { /* ignoriert */ }
  }

  const waterL = water / 1000;
  const netKcal = kcal - burned;
  const overKcal = netKcal > kcalGoal;

  // Hinweise (Glocke)
  const notifs: { icon: React.ReactNode; bg: string; color: string; title: string; text: string }[] = [];
  if (overKcal) notifs.push({ icon: <Flame size={18} />, bg: "#fdeeee", color: "#e0484b", title: t.kcalOverTitle, text: t.notifKcalOverText((netKcal - kcalGoal).toLocaleString(nf)) });
  const restWater = waterGoalL - waterL;
  if (restWater > 0.1) notifs.push({ icon: <GlassWater size={18} />, bg: "#e6f3fb", color: "#2b9fd6", title: t.notifDrinkMoreTitle, text: t.notifDrinkMoreText(de(restWater, 1), de(waterGoalL, 1)) });
  if (med && doses.length === 0) notifs.push({ icon: <Syringe size={18} />, bg: "#f5f1e7", color: "var(--accent2)", title: t.notifDoseTitle, text: t.notifDoseText });
  if (burned === 0) notifs.push({ icon: <Dumbbell size={18} />, bg: "#f3f2ef", color: "#3d3a35", title: t.notifNoWorkoutTitle, text: t.notifNoWorkoutText });

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-dashboard">
      <div className="scr-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="muted" style={{ fontSize: 13 }}>{t.welcomeBack}</div>
          <h1 className="t">{t.hello(firstName)}</h1>
        </div>
        <button className="bell" aria-label={t.notifications} onClick={() => setShowNotif(true)}>
          <Icon name="ic-bell" />
          {notifs.length > 0 && <span className="bdot">{notifs.length}</span>}
        </button>
      </div>

      <div className="scr-body">
        <div className="hero">
          <div className="info">
            <div className="name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {fullName}
              <button
                onClick={() => router.push("/profil")}
                aria-label={t.editData}
                title={t.editData}
                style={{ border: "1px solid var(--line)", background: "#fff", color: "#3d3a35", width: 28, height: 28, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <Pencil size={15} />
              </button>
            </div>
            {sub && <div className="sub">{sub}</div>}
            {m.goalDiff > 0 && (
              <span className="pill" style={{ marginTop: 8 }}>
                <Icon name="ic-target" /> {t.goalLose(de(m.goalDiff, 0))}
              </span>
            )}
            {m.start != null && m.goal != null && (
              <div className="goal">
                <div className="nums" style={{ marginTop: 10 }}>
                  <b
                    onClick={() => { setWeightInput(String(m.current ?? m.start ?? "")); setModal("weight"); }}
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, borderBottom: "1.5px dashed #d9c89a" }}
                    title={t.updateWeight}
                  >
                    {de(m.current ?? m.start)}&nbsp;kg <Pencil size={12} style={{ opacity: 0.6 }} />
                  </b>
                  <b>{de(m.goal)}&nbsp;kg</b>
                </div>
                <div className="track-wrap">
                  <div className="track"><i style={{ width: `${trackW}%` }} /></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="weight-rocket" src="/mascote/fluflyhappy.png" alt="" style={{ left: `${trackW}%` }} />
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 5 }}>
                  {t.progress(de(m.lost), de(m.toGo))}
                </div>
              </div>
            )}
          </div>
          <div className="av-edit" onClick={() => avatarInput.current?.click()} title={t.changePhoto}>
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
            <div className="h"><span className="ic" style={{ background: "#f4f3f0", color: "#3d3a35" }}><Icon name="ic-body" style={{ width: 16 }} /></span> {t.bmi}</div>
            <div className="v">{m.bmi != null ? de(m.bmi) : "—"}</div>
            <span className={`tag ${cat.tag}`}>{cat.label}</span>
          </div>

          <div
            className="stat"
            style={overKcal ? {
              backgroundImage: "url(/mascote/flyfibravo.png)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right -6px bottom -6px",
              backgroundSize: "76px",
            } : undefined}
          >
            <button className="stat-add" onClick={() => setModal("kcal")} aria-label={t.addKcal}><Plus size={17} /></button>
            <div className="h"><span className="ic" style={{ background: "#f4f3f0", color: "#3d3a35" }}><Icon name="ic-flame" style={{ width: 16 }} /></span> {t.kcalToday}</div>
            <div className="v">
              <span style={{ color: overKcal ? "#e0484b" : undefined }}>{Math.max(0, netKcal).toLocaleString(nf)}</span>{" "}
              <small>/ {kcalGoal.toLocaleString(nf)}</small>
            </div>
            {burned > 0 && (
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginTop: 2 }}>{t.burnedByWorkout(burned.toLocaleString(nf))}</div>
            )}
          </div>

          <div className="stat">
            <button className="stat-add" onClick={() => setModal("water")} aria-label={t.addWater}><Plus size={17} /></button>
            <div className="h"><span className="ic" style={{ background: "#f4f3f0", color: "#3d3a35" }}><Icon name="ic-drop" style={{ width: 16 }} /></span> {t.water}</div>
            <div className="v">{de(waterL, 1)} <small>/ {de(waterGoalL, 1)} L</small></div>
          </div>

          <div className="stat">
            <div className="h"><span className="ic" style={{ background: "#f4f3f0", color: "#3d3a35" }}><Icon name="ic-spark" style={{ width: 16 }} /></span> {t.doses}</div>
            <div className="v">{doses.length} <small>{t.total}</small></div>
          </div>
        </div>

        <div className="sec-title">
          <span className="h">{t.treatmentPlan}</span>
          <button className="more" onClick={() => { setDoseForm({ medication: med ?? "Ozempic", dose: profDose, taken_on: todayStr() }); setModal("dose"); }} style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Plus size={15} /> {t.dose}
          </button>
        </div>
        <div className="card">
          {med && (
            <div className="dose next">
              <span className="di di-vial">{/* eslint-disable-next-line @next/next/no-img-element */}<img className="di-img" src="/glp1.png" alt="" /></span>
              <div className="dinfo">
                <div className="dn">{t.nextDose(med)}</div>
                <div className="dd">{freq} · {profDose}</div>
              </div>
              <span className="pill">{t.ready}</span>
            </div>
          )}

          {doses.map((d) => (
            <div className="dose done" key={d.id}>
              <span className="di di-vial">{/* eslint-disable-next-line @next/next/no-img-element */}<img className="di-img" src="/glp1.png" alt="" /></span>
              <div className="dinfo">
                <div className="dn">{d.medication || t.doseFallback} · {d.dose || ""}</div>
                <div className="dd">{t.takenOn(formatDate(d.taken_on))}</div>
              </div>
              <button onClick={() => deleteDose(d.id)} aria-label={t.delete} style={{ border: "none", background: "none", color: "#c6bca2", cursor: "pointer", flexShrink: 0 }}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}

          {!med && doses.length === 0 && (
            <div className="dose next">
              <span className="di di-vial">{/* eslint-disable-next-line @next/next/no-img-element */}<img className="di-img" src="/glp1.png" alt="" /></span>
              <div className="dinfo">
                <div className="dn">{t.noDoseTitle}</div>
                <div className="dd">{t.noDoseText}</div>
              </div>
            </div>
          )}
        </div>

        {planText && planText.tips.length > 0 && (
          <>
            <div className="sec-title">
              <span className="h">{t.tipsTitle}</span>
              <span className="more">{t.tipsBy}</span>
            </div>
            <div className="card">
              {planText.motivation && (
                <p style={{ margin: "0 0 12px", fontSize: 14.5, fontWeight: 700, color: "var(--accent2)" }}>{planText.motivation}</p>
              )}
              {planText.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 11, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                  <span style={{ flexShrink: 0, color: "var(--accent2)", marginTop: 1 }}><Icon name="ic-check-c" /></span>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={onScan} className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: "#fff" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/camera1.png" alt="" style={{ width: 46, height: 46, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontWeight: 800, fontSize: 14.5 }}>{t.scanMeal}</span>
            <span className="muted" style={{ fontSize: 12 }}>{t.scanMealSub}</span>
          </span>
          <span className="muted"><Icon name="ic-chev" /></span>
        </button>
      </div>

      {/* ===== Modals ===== */}
      {modal === "water" && (
        <Modal title={t.addWater} onClose={() => { setModal(null); setFlash(null); }}>
          {flash && (
            <span key={flash.key} className="water-float" style={{ color: flash.color }} onAnimationEnd={() => setFlash(null)}>
              {flash.text}
            </span>
          )}
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>{t.todayWater(de(waterL, 1), de(waterGoalL, 1))}</p>
          <div className="modal-quick">
            <button onClick={() => changeWater(250)}>
              <span className="wicon"><GlassWater size={22} /></span>
              +250 ml
            </button>
            <button onClick={() => changeWater(500)}>
              <span className="wicon" style={{ gap: 1 }}><GlassWater size={19} /><GlassWater size={19} /></span>
              +500 ml
            </button>
            <button onClick={() => changeWater(750)}>
              <span className="wicon"><Milk size={24} /></span>
              +750 ml
            </button>
          </div>
          <button className="qz-next" style={{ width: "100%", marginTop: 6 }} onClick={() => { setModal(null); setFlash(null); }}>{t.done}</button>
          <button onClick={() => changeWater(-250)} style={{ width: "100%", marginTop: 10, border: "none", background: "none", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.undoWater}</button>
        </Modal>
      )}

      {modal === "kcal" && (
        <Modal title={t.addKcal} onClose={() => setModal(null)}>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>{t.todayKcal(kcal.toLocaleString(nf), kcalGoal.toLocaleString(nf))}</p>
          <input
            className="qz-input"
            type="number"
            inputMode="numeric"
            placeholder={t.kcalPlaceholder}
            value={kcalInput}
            onChange={(e) => setKcalInput(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") submitKcal(); }}
          />
          <button className="qz-next" style={{ width: "100%", marginTop: 14 }} onClick={submitKcal}>{t.add}</button>
        </Modal>
      )}

      {modal === "weight" && (
        <Modal title={t.enterWeight} onClose={() => setModal(null)}>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
            {t.startGoal(m.start != null ? de(m.start) : "—", m.goal != null ? de(m.goal) : "—")}
          </p>
          <div className="lg-label">{t.yourCurrentWeight}</div>
          <input
            className="qz-input"
            type="number"
            inputMode="decimal"
            placeholder={t.weightPlaceholder}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") submitWeight(); }}
          />
          <button className="qz-next" style={{ width: "100%", marginTop: 14 }} onClick={submitWeight}>{t.save}</button>
        </Modal>
      )}

      {modal === "dose" && (
        <Modal title={t.enterDose} onClose={() => setModal(null)}>
          <div className="lg-label">{t.medication}</div>
          <select className="qz-input" value={doseForm.medication} onChange={(e) => setDoseForm((p) => ({ ...p, medication: e.target.value }))} style={{ appearance: "auto", marginBottom: 12 }}>
            {MEDS.map((mm) => <option key={mm}>{mm}</option>)}
          </select>
          <div className="lg-label">{t.dose}</div>
          <select className="qz-input" value={doseForm.dose} onChange={(e) => setDoseForm((p) => ({ ...p, dose: e.target.value }))} style={{ appearance: "auto", marginBottom: 12 }}>
            {DOSES.map((dd) => <option key={dd}>{dd}</option>)}
          </select>
          <div className="lg-label">{t.date}</div>
          <input className="qz-input" type="date" value={doseForm.taken_on} onChange={(e) => setDoseForm((p) => ({ ...p, taken_on: e.target.value }))} style={{ marginBottom: 4 }} />
          <button className="qz-next" style={{ width: "100%", marginTop: 14 }} onClick={submitDose}>{t.register}</button>
        </Modal>
      )}

      {alert && <Alert title={alert.title} message={alert.message} tone={alert.tone} onClose={() => setAlert(null)} />}

      {showNotif && (
        <Modal title={t.hints} onClose={() => setShowNotif(false)}>
          {notifs.length === 0 ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "6px 0" }}>
              <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 12, background: "#eef4ef", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={20} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.allGoodTitle}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{t.allGoodText}</div>
              </div>
            </div>
          ) : (
            notifs.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 12, background: n.bg, color: n.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>{n.text}</div>
                </div>
              </div>
            ))
          )}
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

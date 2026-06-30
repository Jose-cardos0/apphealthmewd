"use client";

import { useCallback, useEffect, useState } from "react";
import { Dumbbell, Check, Flame, Clock, RotateCcw, Moon } from "lucide-react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import LoadingOverlay from "@/components/LoadingOverlay";
import { saveWeeklyPlan, getWeeklyPlan, logWorkoutDone, getTodayWorkoutLogs } from "@/lib/workouts";
import type { Profile, WeeklyPlan, WorkoutDay, WorkoutLog, WorkoutExercise } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const DAYS_SHORT = {
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
} as const;
const todayIdx = () => (new Date().getDay() + 6) % 7; // Mo=0 … So=6

const TX = {
  de: {
    title: "Coach",
    sub: "Dein Wochenplan zum Abnehmen – von Flufy.",
    newWeek: "Neue Woche",
    burnedToday: "Heute verbrannt",
    burned: (kcal: string, n: number) => `${kcal} kcal · ${n} Training${n > 1 ? "s" : ""}`,
    createWeek: "Trainingswoche erstellen",
    emptyDesc: (name: string) =>
      `Flufy baut dir${name ? ` ${name}` : ""} eine komplette Woche – basierend auf deinen Angaben, immer mit Fokus aufs Abnehmen.`,
    restDay: "Ruhetag",
    restDesc: "Erholung gehört dazu. Trink genug Wasser und beweg dich locker.",
    minUnit: "Min",
    exercises: "Übungen",
    pauseSuffix: (sek: number | string) => ` · ${sek}s Pause`,
    cardioLight: "Cardio (leicht)",
    trainingDone: "Training erledigt",
    setsLabel: "Sätze",
    repsLabel: "Wdh.",
    pauseLabel: (sek: number | string) => `${sek}s Pause`,
    noAnimation: "Für diese Übung ist gerade keine Animation verfügbar.",
    loading: "Flufy baut deine Trainingswoche …",
    genError: (msg: string) =>
      "Flufy konnte gerade keinen Plan erstellen. Bitte versuche es erneut. (" + msg + ")",
    doneToast: (kcal: number) => `Stark! ${kcal} kcal verbrannt – im Start angerechnet.`,
    disc:
      "Flufy ist eine KI und erstellt Vorschläge auf Basis von Informationen aus dem Internet – keine medizinische oder physiotherapeutische Beratung. Bei Schmerzen, Vorerkrankungen oder Unsicherheit halte vor dem Training bitte Rücksprache mit einer Ärztin/einem Arzt oder einer Fachkraft.",
  },
  en: {
    title: "Coach",
    sub: "Your weekly plan to lose weight – by Flufy.",
    newWeek: "New week",
    burnedToday: "Burned today",
    burned: (kcal: string, n: number) => `${kcal} kcal · ${n} workout${n > 1 ? "s" : ""}`,
    createWeek: "Create a training week",
    emptyDesc: (name: string) =>
      `Flufy builds you${name ? ` ${name}` : ""} a full week – based on your details, always focused on losing weight.`,
    restDay: "Rest day",
    restDesc: "Recovery is part of it. Drink enough water and move gently.",
    minUnit: "min",
    exercises: "Exercises",
    pauseSuffix: (sek: number | string) => ` · ${sek}s rest`,
    cardioLight: "Cardio (light)",
    trainingDone: "Workout done",
    setsLabel: "sets",
    repsLabel: "reps",
    pauseLabel: (sek: number | string) => `${sek}s rest`,
    noAnimation: "No animation is available for this exercise right now.",
    loading: "Flufy is building your training week …",
    genError: (msg: string) =>
      "Flufy couldn't create a plan right now. Please try again. (" + msg + ")",
    doneToast: (kcal: number) => `Great! ${kcal} kcal burned – counted on your Home screen.`,
    disc:
      "Flufy is an AI and makes suggestions based on information from the internet – not medical or physiotherapeutic advice. If you have pain, pre-existing conditions or any doubt, please consult a doctor or a qualified professional before training.",
  },
} as const;

export default function Coach({ active, profile }: { active: boolean; profile: Profile | null }) {
  const { lang } = useI18n();
  const t = TX[lang];
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState(todayIdx());
  const [doneToday, setDoneToday] = useState<WorkoutLog[]>([]);
  const [bigEx, setBigEx] = useState<WorkoutExercise | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyDone, setBusyDone] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [sp, logs] = await Promise.all([getWeeklyPlan(), getTodayWorkoutLogs()]);
      // Nur gültige Wochenpläne übernehmen (alte Einzel-Workouts ignorieren)
      if (sp?.data && Array.isArray(sp.data.tage) && sp.data.tage.length > 0) setPlan(sp.data);
      setDoneToday(logs);
    } catch {
      /* offline */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (active && !loaded) reload();
  }, [active, loaded, reload]);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grok/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: "", lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler");
      const wp = normalize(data);
      await saveWeeklyPlan(wp).catch(() => {});
      setPlan(wp);
      setDayIdx(todayIdx());
    } catch (err) {
      setError(t.genError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function markDone(d: WorkoutDay) {
    if (busyDone || d.rest) return;
    setBusyDone(true);
    try {
      const kcal = d.kcal_verbrennung || 0;
      const log = await logWorkoutDone({ title: d.titel || d.tag, burned_kcal: kcal });
      setDoneToday((p) => [log, ...p]);
      flash(t.doneToast(kcal));
    } catch {
      /* ignoriert */
    } finally {
      setBusyDone(false);
    }
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  const burnedToday = doneToday.reduce((s, l) => s + (l.burned_kcal || 0), 0);
  const name = profile?.first_name || "";
  const day = plan?.tage?.[dayIdx];

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-coach">
      {loading && <LoadingOverlay text={t.loading} image="/mascote/fluflycoach.png" />}

      <div className="scr-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="t">{t.title}</h1>
          <div className="muted" style={{ fontSize: 13 }}>{t.sub}</div>
        </div>
        {plan && (
          <button onClick={generate} style={{ flexShrink: 0, height: 38, padding: "0 14px", borderRadius: 12, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RotateCcw size={15} /> {t.newWeek}
          </button>
        )}
      </div>

      <div className="scr-body">
        {burnedToday > 0 && (
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden", backgroundImage: "url(/mascote/foguete1.png)", backgroundRepeat: "no-repeat", backgroundPosition: "right -8px bottom -12px", backgroundSize: "88px" }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: "#eef4ef", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Flame size={19} /></span>
            <div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{t.burnedToday}</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{t.burned(burnedToday.toLocaleString(lang === "de" ? "de-DE" : "en-US"), doneToday.length)}</div>
            </div>
          </div>
        )}

        {error && <div className="card" style={{ color: "#c0392b", fontSize: 14, fontWeight: 600 }}>{error}</div>}

        {/* Leerer Zustand: runder Button */}
        {!plan && loaded && !loading && (
          <div style={{ textAlign: "center", padding: "30px 18px 10px" }}>
            <button className="coach-fab" onClick={generate} aria-label={t.createWeek}>
              <Dumbbell size={42} />
            </button>
            <h3 style={{ margin: "20px 0 4px", fontSize: 18, fontWeight: 800 }}>{t.createWeek}</h3>
            <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
              {t.emptyDesc(name)}
            </p>
          </div>
        )}

        {/* Wochenplan */}
        {plan && (
          <>
            <div className="coach-days">
              {(plan.tage ?? []).map((d, i) => (
                <button
                  key={i}
                  className={`coach-day${i === dayIdx ? " active" : ""}${d.rest ? " rest" : ""}`}
                  onClick={() => setDayIdx(i)}
                >
                  {DAYS_SHORT[lang][i] ?? d.tag?.slice(0, 2)}
                  {i === todayIdx() && <span className="coach-today-dot" />}
                </button>
              ))}
            </div>

            {day && (day.rest ? (
              <div className="card" style={{ textAlign: "center", padding: "30px 18px" }}>
                <span style={{ display: "inline-flex", width: 46, height: 46, borderRadius: 14, background: "#f4f3f0", color: "#3d3a35", alignItems: "center", justifyContent: "center" }}><Moon size={22} /></span>
                <h3 style={{ margin: "12px 0 2px", fontSize: 17, fontWeight: 800 }}>{day.tag} · {t.restDay}</h3>
                <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>{t.restDesc}</p>
              </div>
            ) : (
              <div className="card" key={dayIdx} style={{ animation: "scanIn .3s ease both" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>{day.tag}{day.titel ? ` · ${day.titel}` : ""}</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {day.fokus && <span className="pill">{day.fokus}</span>}
                  {day.dauer_min ? <span className="pill" style={{ background: "#f3f2ef", color: "#3d3a35" }}><Clock size={13} /> {day.dauer_min} {t.minUnit}</span> : null}
                  {day.kcal_verbrennung ? <span className="pill" style={{ background: "#fdeeee", color: "#e0484b" }}><Flame size={13} /> ~{day.kcal_verbrennung} kcal</span> : null}
                </div>

                {(day.uebungen ?? []).length > 0 && (
                  <>
                    <p className="pe-sec" style={{ marginTop: 14 }}>{t.exercises}</p>
                    <div className="ex-cards">
                      {(day.uebungen ?? []).map((u, i) => (
                        <div key={i} className="ex-card" onClick={() => setBigEx(u)}>
                          <ExThumb term={u.en || u.name} n={i + 1} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="ex-name">{u.name}</div>
                            <div className="ex-meta">{u.saetze} × {u.wdh}{u.pause_sek ? t.pauseSuffix(u.pause_sek) : ""}</div>
                            {u.hinweis && <div className="ex-meta">{u.hinweis}</div>}
                          </div>
                          <span className="muted" style={{ flexShrink: 0 }}><Icon name="ic-chev" /></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {(day.cardio ?? []).length > 0 && (
                  <>
                    <p className="pe-sec" style={{ marginTop: 14 }}>{t.cardioLight}</p>
                    {(day.cardio ?? []).map((c, i) => (
                      <div key={i} className="dose" style={{ alignItems: "center" }}>
                        <span className="di" style={{ background: "#eef4ef", color: "var(--green)" }}><Icon name="ic-flame" /></span>
                        <div className="dinfo"><div className="dn">{c.name}</div><div className="dd">{c.dauer}{c.hinweis ? ` · ${c.hinweis}` : ""}</div></div>
                      </div>
                    ))}
                  </>
                )}

                <button className="lg-btn" style={{ marginTop: 16, height: 50 }} onClick={() => markDone(day)} disabled={busyDone}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Check size={18} /> {t.trainingDone}</span>
                </button>
              </div>
            ))}
          </>
        )}

        <p className="note-disc" style={{ marginTop: 16 }}>
          {t.disc}
        </p>
      </div>

      {bigEx && (
        <Modal title={bigEx.name} onClose={() => setBigEx(null)}>
          <ExBig term={bigEx.en || bigEx.name} name={bigEx.name} />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <span className="pill" style={{ background: "#f3f2ef", color: "#3d3a35" }}>{bigEx.saetze} {t.setsLabel}</span>
            <span className="pill" style={{ background: "#f3f2ef", color: "#3d3a35" }}>{bigEx.wdh} {t.repsLabel}</span>
            {bigEx.pause_sek && <span className="pill" style={{ background: "#f3f2ef", color: "#3d3a35" }}>{t.pauseLabel(bigEx.pause_sek)}</span>}
          </div>
          {bigEx.hinweis && <p style={{ marginTop: 12, marginBottom: 0, fontSize: 14, lineHeight: 1.5, color: "var(--ink)" }}>{bigEx.hinweis}</p>}
        </Modal>
      )}

      {toast && <div className="coach-toast">{toast}</div>}
    </section>
  );
}

function gifUrlFor(term: string): string {
  return `/api/exercise-gif?q=${encodeURIComponent(term)}`;
}

/** Karten-Thumbnail mit Übungs-GIF (fällt auf die Nummer zurück, wenn kein GIF existiert). */
function ExThumb({ term, n }: { term: string; n: number }) {
  const [err, setErr] = useState(false);
  return (
    <span className="ex-thumb">
      {!term || err ? (
        <span className="ex-num">{n}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={gifUrlFor(term)} alt="" onError={() => setErr(true)} />
      )}
    </span>
  );
}

/** Großes GIF im Popup (mit Fallback-Text). */
function ExBig({ term, name }: { term: string; name: string }) {
  const { lang } = useI18n();
  const t = TX[lang];
  const [err, setErr] = useState(false);
  if (!term || err) {
    return (
      <div style={{ textAlign: "center", padding: "30px 14px", background: "#faf9f7", border: "1px solid var(--line)", borderRadius: 14, color: "var(--muted)", fontSize: 13.5 }}>
        {t.noAnimation}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={gifUrlFor(term)} alt={name} onError={() => setErr(true)} style={{ width: "100%", borderRadius: 14, background: "#fff", border: "1px solid var(--line)" }} />
  );
}

function normalize(d: Partial<WeeklyPlan>): WeeklyPlan {
  const tage = Array.isArray(d.tage) ? d.tage : [];
  return {
    titel: d.titel || "Deine Trainingswoche",
    fokus: d.fokus || "Abnehmen",
    tage: tage.map((t) => ({
      tag: t.tag || "",
      rest: !!t.rest,
      titel: t.titel,
      fokus: t.fokus,
      dauer_min: t.dauer_min ? Math.round(Number(t.dauer_min)) : undefined,
      kcal_verbrennung: t.kcal_verbrennung ? Math.round(Number(t.kcal_verbrennung)) : undefined,
      uebungen: Array.isArray(t.uebungen) ? t.uebungen : [],
      cardio: Array.isArray(t.cardio) ? t.cardio : [],
    })),
  };
}

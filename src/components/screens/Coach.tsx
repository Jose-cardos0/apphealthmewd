"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Dumbbell, Trash2, Check, Clock, Flame, Bookmark } from "lucide-react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import { listWorkouts, addWorkout, removeWorkout, logWorkoutDone, getTodayWorkoutLogs } from "@/lib/workouts";
import type { Profile, Workout, SavedWorkout, WorkoutLog } from "@/lib/types";

export default function Coach({ active, profile }: { active: boolean; profile: Profile | null }) {
  const [wish, setWish] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Workout | null>(null);
  const [resultSavedId, setResultSavedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedWorkout[]>([]);
  const [doneToday, setDoneToday] = useState<WorkoutLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [busyDone, setBusyDone] = useState(false);
  const [bigGif, setBigGif] = useState<{ url: string; name: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    try {
      const [ws, logs] = await Promise.all([listWorkouts(), getTodayWorkoutLogs()]);
      setSaved(ws);
      setDoneToday(logs);
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    if (active) reload();
  }, [active, reload]);

  async function generate() {
    setError(null);
    setLoading(true);
    setResult(null);
    setResultSavedId(null);
    try {
      const res = await fetch("/api/grok/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler");
      setResult(normalize(data));
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (err) {
      setError("Flufy konnte gerade keinen Plan erstellen. Bitte versuche es erneut. (" + (err instanceof Error ? err.message : "") + ")");
    } finally {
      setLoading(false);
    }
  }

  async function saveResult() {
    if (!result || resultSavedId) return;
    try {
      const row = await addWorkout(result.titel, result);
      setSaved((p) => [row, ...p]);
      setResultSavedId(row.id);
      flash("Trainingsplan gespeichert");
    } catch {
      /* ignoriert */
    }
  }

  async function markDone(w: Workout, id?: string) {
    if (busyDone) return;
    setBusyDone(true);
    try {
      const log = await logWorkoutDone({ id, title: w.titel, burned_kcal: w.kcal_verbrennung });
      setDoneToday((p) => [log, ...p]);
      flash(`Stark! ${w.kcal_verbrennung} kcal verbrannt – im Start angerechnet.`);
    } catch {
      /* ignoriert */
    } finally {
      setBusyDone(false);
    }
  }

  async function removeSaved(id: string) {
    setSaved((p) => p.filter((x) => x.id !== id));
    if (resultSavedId === id) setResultSavedId(null);
    try { await removeWorkout(id); } catch { /* ignoriert */ }
  }

  function view(w: SavedWorkout) {
    setResult(w.data);
    setResultSavedId(w.id);
    setError(null);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  const burnedToday = doneToday.reduce((s, l) => s + (l.burned_kcal || 0), 0);
  const name = profile?.first_name || "";

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-coach">
      <div className="scr-head">
        <h1 className="t">Coach</h1>
        <div className="muted" style={{ fontSize: 13 }}>
          Flufy erstellt dir ein Workout zum Abnehmen – mit leichtem Cardio.
        </div>
      </div>

      <div className="scr-body" ref={topRef}>
        {burnedToday > 0 && (
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: "#eef4ef", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Flame size={19} />
            </span>
            <div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Heute verbrannt</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{burnedToday.toLocaleString("de-DE")} kcal · {doneToday.length} Training{doneToday.length > 1 ? "s" : ""}</div>
            </div>
          </div>
        )}

        {/* Eingabe */}
        <div className="card">
          <div className="lg-label">Was möchtest du trainieren? (optional)</div>
          <input
            className="qz-input"
            placeholder='z. B. "Ganzkörper 30 Min, zu Hause" oder "Beine & Po"'
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
          />
          <button className="lg-btn" style={{ marginTop: 14 }} onClick={generate} disabled={loading}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <Sparkles size={18} /> {loading ? "Flufy erstellt deinen Plan …" : "Trainingsplan erstellen"}
            </span>
          </button>
        </div>

        {error && (
          <div className="card" style={{ color: "#c0392b", fontSize: 14, fontWeight: 600 }}>{error}</div>
        )}

        {/* Ergebnis */}
        {result && (
          <div className="card" style={{ animation: "scanIn .35s ease both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>{result.titel}</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="pill">{result.fokus}</span>
                  <span className="pill" style={{ background: "#f3f2ef", color: "#3d3a35" }}><Clock size={13} /> {result.dauer_min} Min</span>
                  <span className="pill" style={{ background: "#fdeeee", color: "#e0484b" }}><Flame size={13} /> ~{result.kcal_verbrennung} kcal</span>
                </div>
              </div>
            </div>

            {result.uebungen.length > 0 && (
              <>
                <p className="pe-sec" style={{ marginTop: 18 }}>Übungen</p>
                {result.uebungen.map((u, i) => (
                  <div key={i} className="dose" style={{ alignItems: "center" }}>
                    <span className="di" style={{ background: "#f4f3f0", color: "#3d3a35" }}>{i + 1}</span>
                    <div className="dinfo">
                      <div className="dn">{u.name}</div>
                      <div className="dd">{u.saetze} × {u.wdh}{u.pause_sek ? ` · ${u.pause_sek}s Pause` : ""}{u.hinweis ? ` · ${u.hinweis}` : ""}</div>
                    </div>
                    {u.gifUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="ex-gif" src={u.gifUrl} alt={u.name} onClick={() => setBigGif({ url: u.gifUrl as string, name: u.name })} />
                    )}
                  </div>
                ))}
              </>
            )}

            {result.cardio.length > 0 && (
              <>
                <p className="pe-sec" style={{ marginTop: 16 }}>Cardio (leicht)</p>
                {result.cardio.map((c, i) => (
                  <div key={i} className="dose" style={{ alignItems: "flex-start" }}>
                    <span className="di" style={{ background: "#eef4ef", color: "var(--green)" }}><Icon name="ic-flame" /></span>
                    <div className="dinfo">
                      <div className="dn">{c.name}</div>
                      <div className="dd">{c.dauer}{c.hinweis ? ` · ${c.hinweis}` : ""}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {result.tipps.length > 0 && (
              <div style={{ marginTop: 14, background: "#faf9f7", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                {result.tipps.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 13.5, color: "var(--ink)" }}>
                    <span style={{ color: "var(--accent2)", flexShrink: 0 }}>•</span> {t}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="lg-btn" style={{ flex: 1, marginTop: 0, height: 50 }} onClick={() => markDone(result, resultSavedId ?? undefined)} disabled={busyDone}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Check size={18} /> Heute erledigt</span>
              </button>
              <button
                onClick={saveResult}
                disabled={!!resultSavedId}
                style={{ flex: "0 0 auto", height: 50, padding: "0 16px", borderRadius: 14, border: "1px solid var(--line)", background: resultSavedId ? "#eef4ef" : "#fff", color: resultSavedId ? "var(--green)" : "var(--ink)", fontWeight: 600, fontSize: 14, cursor: resultSavedId ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Bookmark size={17} /> {resultSavedId ? "Gespeichert" : "Speichern"}
              </button>
            </div>
          </div>
        )}

        {/* Gespeicherte Pläne */}
        {saved.length > 0 && (
          <>
            <div className="sec-title"><span className="h">Meine Trainingspläne</span></div>
            {saved.map((w) => (
              <div className="card" key={w.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "#f4f3f0", color: "#3d3a35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Dumbbell size={19} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.data.titel}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{w.data.fokus} · ~{w.data.kcal_verbrennung} kcal</div>
                </div>
                <button onClick={() => view(w)} style={{ flexShrink: 0, height: 38, padding: "0 14px", borderRadius: 11, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Ansehen</button>
                <button onClick={() => markDone(w.data, w.id)} aria-label="Heute erledigt" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, border: "none", background: "var(--btn)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Check size={17} /></button>
                <button onClick={() => removeSaved(w.id)} aria-label="Löschen" style={{ flexShrink: 0, border: "none", background: "none", color: "#c6bca2", cursor: "pointer" }}><Trash2 size={17} /></button>
              </div>
            ))}
          </>
        )}

        {!result && saved.length === 0 && !loading && (
          <div className="card" style={{ textAlign: "center", padding: "28px 18px", color: "var(--muted)" }}>
            <Dumbbell size={28} style={{ opacity: 0.5 }} />
            <p style={{ margin: "10px 0 0", fontSize: 14 }}>Noch kein Trainingsplan. Lass Flufy einen für dich erstellen{name ? `, ${name}` : ""}!</p>
          </div>
        )}

        <p className="note-disc" style={{ marginTop: 16 }}>
          Flufy ist eine KI und erstellt Vorschläge auf Basis von Informationen aus dem Internet – keine medizinische
          oder physiotherapeutische Beratung. Bei Schmerzen, Vorerkrankungen oder Unsicherheit halte vor dem Training
          bitte Rücksprache mit einer Ärztin/einem Arzt oder einer Fachkraft.
        </p>
      </div>

      {bigGif && (
        <Modal title={bigGif.name} onClose={() => setBigGif(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bigGif.url} alt={bigGif.name} style={{ width: "100%", borderRadius: 14, background: "#fff" }} />
          <p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 10, marginBottom: 0 }}>Animation: ExerciseDB</p>
        </Modal>
      )}

      {toast && <div className="coach-toast">{toast}</div>}
    </section>
  );
}

function normalize(d: Partial<Workout>): Workout {
  return {
    titel: d.titel || "Dein Workout",
    fokus: d.fokus || "Abnehmen",
    dauer_min: Math.max(5, Math.round(Number(d.dauer_min) || 30)),
    kcal_verbrennung: Math.max(0, Math.round(Number(d.kcal_verbrennung) || 250)),
    uebungen: Array.isArray(d.uebungen) ? d.uebungen : [],
    cardio: Array.isArray(d.cardio) ? d.cardio : [],
    tipps: Array.isArray(d.tipps) ? d.tipps : [],
  };
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import Icon from "@/components/Icon";
import { getDailyLog, saveDailyLog } from "@/lib/logs";

type Food = { name: string; kcal: number; detail: string };
type Summe = { kcal: number; protein_g: number; kohlenhydrate_g: number; fett_g: number; ballaststoffe_g?: number };
type Result = { erkannt: boolean; gericht?: string; lebensmittel?: Food[]; summe?: Summe };

type Phase = "idle" | "analyzing" | "result" | "error";

/** Ordnet einem Lebensmittel anhand des Namens Icon + Farbe zu. */
function categorize(name: string): { icon: string; bg: string } {
  const n = name.toLowerCase();
  const has = (...w: string[]) => w.some((x) => n.includes(x));
  if (has("fleisch", "hähnch", "hahnch", "rind", "pute", "huhn", "fisch", "lachs", "thunfisch", "ei", "schinken", "wurst", "steak", "schwein"))
    return { icon: "ic-bolt", bg: "#ffcaa8" };
  if (has("reis", "nudel", "pasta", "kartoffel", "pommes", "brot", "brötchen", "bulgur", "couscous", "quinoa", "haferfl", "müsli", "teig"))
    return { icon: "ic-grain", bg: "#e8c071" };
  if (has("gemüse", "gemuse", "brokkoli", "salat", "paprika", "zwiebel", "karotte", "möhre", "mohre", "spinat", "erbsen", "tomate", "gurke", "bohnen", "mais", "avocado", "pilz"))
    return { icon: "ic-leaf", bg: "#8fd6a0" };
  if (has("apfel", "banane", "beere", "obst", "frucht", "orange", "mango", "ananas"))
    return { icon: "ic-carrot", bg: "#f0a35a" };
  if (has("käse", "kase", "joghurt", "milch", "quark", "sahne", "butter", "öl", "ol"))
    return { icon: "ic-drop", bg: "#a06bd6" };
  return { icon: "ic-leaf", bg: "#6fc27a" };
}

export default function Scan({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shot, setShot] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handOn, setHandOn] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [added, setAdded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Desktop: kein Kamera-Aufruf, sondern Datei-Upload
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Tipp-Hand nur im Ausgangszustand animieren
  useEffect(() => {
    if (phase !== "idle") return;
    const t = setInterval(() => setHandOn((v) => !v), 1000);
    return () => clearInterval(t);
  }, [phase]);

  function openCamera() {
    if (phase === "analyzing") return;
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // erlaubt erneutes Auswählen desselben Fotos
    if (!file) return;

    setError(null);
    setResult(null);
    try {
      const dataUrl = await downscale(file, 1024, 0.82);
      setShot(dataUrl);
      setPhase("analyzing");

      const res = await fetch("/api/grok/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data: Result & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);

      if (!data.erkannt) {
        setError("Auf dem Foto konnte keine Mahlzeit erkannt werden. Bitte versuche es erneut.");
        setPhase("error");
        return;
      }
      setResult(data);
      setPhase("result");
      setTimeout(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" }), 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Die Analyse hat nicht geklappt.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setShot(null);
    setResult(null);
    setError(null);
    setAdded(false);
  }

  async function addToToday(kcal: number) {
    setAdded(true);
    try {
      const log = await getDailyLog();
      await saveDailyLog(log.water_ml, log.kcal + kcal);
    } catch {
      /* ignoriert */
    }
  }

  const s = result?.summe;

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-scan">
      <div className="scr-head" style={{ textAlign: "center" }}>
        <h1 className="t">Intelligente Ernährung</h1>
        <div className="muted" style={{ fontSize: 13 }}>Fotografiere deine Mahlzeit und erhalte sofort alle Nährwerte.</div>
      </div>

      <div className="scr-body scan-body" ref={bodyRef}>
        <input ref={fileRef} type="file" accept="image/*" {...(isDesktop ? {} : { capture: "environment" as const })} style={{ display: "none" }} onChange={onFile} />

        <div className="vf" onClick={phase === "idle" || phase === "error" ? openCamera : undefined} style={{ cursor: phase === "idle" || phase === "error" ? "pointer" : "default" }}>
          <div className="reticle" />
          <div className="c2" />

          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="shot" src={shot} alt="" />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="plate" src="/prato.png" alt="" />
              <div className="badge b-kcal"><span className="d" style={{ background: "#ff6b3d" }}><Icon name="ic-flame" /></span><div><b>KI</b> kcal</div></div>
              <div className="badge b-prot"><span className="d" style={{ background: "#ff9500" }}><Icon name="ic-bolt" /></span><div><b>Protein</b><small>automatisch</small></div></div>
              <div className="badge b-fat"><span className="d" style={{ background: "#a06bd6" }}><Icon name="ic-drop" /></span><div><b>Fett</b><small>automatisch</small></div></div>
            </>
          )}

          {phase === "analyzing" && <span className="scanline" />}
          {phase === "idle" && <span className="tap-ring" />}
          {phase === "idle" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={`scan-hand${handOn ? " tap" : ""}`} src={handOn ? "/handleclick1.png" : "/handleok.png"} alt="" />
          )}
        </div>

        <p className="scan-hint">
          {phase === "idle" && (isDesktop ? "Klicke auf den Teller, um ein Foto hochzuladen" : "Tippe auf den Teller, um zu fotografieren")}
          {phase === "analyzing" && "Analysiere dein Foto …"}
          {phase === "error" && (isDesktop ? "Klicke, um ein neues Foto hochzuladen" : "Tippe, um ein neues Foto aufzunehmen")}
          {phase === "result" && result?.gericht}
        </p>

        {phase === "error" && error && (
          <div className="result" style={{ borderTop: "1px solid var(--line)" }}>
            <p style={{ margin: 0, color: "#c0392b", fontSize: 14, fontWeight: 600 }}>{error}</p>
            <button className="lg-btn" style={{ height: 50, marginTop: 14 }} onClick={openCamera}>Neues Foto aufnehmen</button>
          </div>
        )}

        {phase === "result" && result?.erkannt && (
          <div className="result">
            <div className="rt"><Icon name="ic-check-c" style={{ color: "var(--accent2)" }} /> {result.gericht || "Mahlzeit erkannt"}</div>
            <div className="ai"><Icon name="ic-spark" style={{ width: 14, color: "var(--accent2)" }} /> Analysiert von HealthMe KI</div>

            {(result.lebensmittel || []).map((f, i) => {
              const c = categorize(f.name);
              return (
                <div className="food" key={i}>
                  <span className="fi" style={{ background: c.bg }}><Icon name={c.icon} /></span>
                  <span className="fn">{f.name}</span>
                  <span className="fk">{f.kcal} kcal · {f.detail}</span>
                </div>
              );
            })}

            {s && (
              <div className="tot">
                <Macro bg="#fde2e1" color="#e0484b" value={`${s.kcal}`} label="kcal" />
                <Macro bg="#ffe9cc" color="#d98324" value={`${s.protein_g} g`} label="Protein" />
                <Macro bg="#e3f6e6" color="#1f9d4d" value={`${s.kohlenhydrate_g} g`} label="Kohlenh." />
                <Macro bg="#fff3cc" color="#b58a00" value={`${s.fett_g} g`} label="Fett" />
              </div>
            )}

            {s && (
              <button
                className="lg-btn"
                style={{ height: 52, marginTop: 16, background: added ? "linear-gradient(135deg,#34c759,#1f9d4d)" : undefined }}
                onClick={() => addToToday(s.kcal)}
                disabled={added}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  {added ? (<><Check size={18} /> Zu heute hinzugefügt</>) : (<><Plus size={18} /> {s.kcal} kcal zu heute hinzufügen</>)}
                </span>
              </button>
            )}

            <button
              onClick={reset}
              style={{ width: "100%", height: 48, marginTop: 10, border: "1.5px solid var(--line)", background: "#fff", borderRadius: 16, color: "var(--accent2)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Neue Mahlzeit scannen
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Macro({ bg, color, value, label }: { bg: string; color: string; value: string; label: string }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "10px 4px" }}>
      <b style={{ color, fontSize: 15, fontWeight: 800 }}>{value}</b>
      <small style={{ display: "block", fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{label}</small>
    </div>
  );
}

/** Verkleinert ein Bild clientseitig (max. Kante, JPEG) und liefert eine Data-URL. */
function downscale(file: File, maxEdge: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas nicht verfügbar"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden"));
    };
    img.src = url;
  });
}

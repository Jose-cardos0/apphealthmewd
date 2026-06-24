"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

export default function Scan({ active }: { active: boolean }) {
  const [handOn, setHandOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanned) return;
    const t = setInterval(() => setHandOn((v) => !v), 1000);
    return () => clearInterval(t);
  }, [scanned]);

  function doScan() {
    if (scanned) return;
    setScanned(true);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(true);
      setTimeout(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" }), 60);
    }, 1400);
  }

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-scan">
      <div className="scr-head" style={{ textAlign: "center" }}>
        <h1 className="t">Intelligente Ernährung</h1>
        <div className="muted" style={{ fontSize: 13 }}>Scanne deine Mahlzeit und erhalte sofort alle Nährwerte.</div>
      </div>
      <div className="scr-body scan-body" ref={bodyRef}>
        <div className="vf" onClick={doScan}>
          <div className="reticle" />
          <div className="c2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="plate" src="/prato.png" alt="" />
          <div className="badge b-kcal"><span className="d" style={{ background: "#ff6b3d" }}><Icon name="ic-flame" /></span><div><b>612</b> kcal</div></div>
          <div className="badge b-carb"><span className="d" style={{ background: "#5ac8fa" }}><Icon name="ic-grain" /></span><div><b>64 g</b><small>Kohlenhydrate</small></div></div>
          <div className="badge b-prot"><span className="d" style={{ background: "#ff9500" }}><Icon name="ic-bolt" /></span><div><b>32 g</b><small>Protein</small></div></div>
          <div className="badge b-fib"><span className="d" style={{ background: "#34c759" }}><Icon name="ic-leaf" /></span><div><b>9 g</b><small>Ballaststoffe</small></div></div>
          <div className="badge b-fat"><span className="d" style={{ background: "#a06bd6" }}><Icon name="ic-drop" /></span><div><b>22 g</b><small>Fett</small></div></div>
          {!scanned && <span className="tap-ring" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`scan-hand${scanned ? " done" : handOn ? " tap" : ""}`}
            src={scanned ? "/handleok.png" : handOn ? "/handleclick1.png" : "/handleok.png"}
            alt=""
          />
        </div>

        <p className="scan-hint">
          {analyzing ? "Analysiere …" : result ? "" : "Tippe auf den Teller, um zu analysieren"}
        </p>

        {result && (
          <div className="result">
            <div className="rt"><Icon name="ic-check-c" style={{ color: "var(--accent2)" }} /> Mahlzeit erkannt</div>
            <div className="ai"><Icon name="ic-spark" style={{ width: 14, color: "var(--accent2)" }} /> Analysiert von HealthMe KI</div>
            <Food bg="#ffcaa8" icon="ic-bolt" name="Hähnchenbrust" k="165 kcal · 31 g Protein" />
            <Food bg="#8fd6a0" icon="ic-grain" name="Erbsen" k="81 kcal · 5 g Eiweiß" />
            <Food bg="#6fc27a" icon="ic-leaf" name="Brokkoli" k="34 kcal · 7 g Ballaststoffe" />
            <Food bg="#e8c071" icon="ic-grain" name="Kartoffeln" k="163 kcal · 37 g Kohlenh." />
            <Food bg="#f0a35a" icon="ic-carrot" name="Karotten" k="41 kcal · 10 g Kohlenh." />
            <div className="tot">
              <div><b>612</b><small>kcal</small></div>
              <div><b>32 g</b><small>Protein</small></div>
              <div><b>64 g</b><small>Kohlenh.</small></div>
              <div><b>22 g</b><small>Fett</small></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Food({ bg, icon, name, k }: { bg: string; icon: string; name: string; k: string }) {
  return (
    <div className="food">
      <span className="fi" style={{ background: bg }}><Icon name={icon} /></span>
      <span className="fn">{name}</span>
      <span className="fk">{k}</span>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { calcBmi, bmiCategory, bmiScalePos, de } from "@/lib/metrics";
import type { Profile } from "@/lib/types";

const SOURCES = [
  { a: "Wirksamkeit & Risiken von GLP-1", b: "Nature Medicine", href: "https://www.nature.com/subjects/glp-1" },
  { a: "Die Zukunft der Adipositas-Behandlung", b: "Harvard Magazine", href: "https://www.harvardmagazine.com/topics/health-medicine" },
  { a: "Messung von Körperfett & BMI", b: "Harvard T.H. Chan", href: "https://www.hsph.harvard.edu/obesity-prevention-source/obesity-definition/" },
  { a: "Forschung zu GLP-1-Medikamenten", b: "UChicago Medicine", href: "https://www.uchicagomedicine.org/forefront/gastrointestinal-articles" },
];

export default function Wissen({ active, profile }: { active: boolean; profile: Profile | null }) {
  const weight = profile?.current_weight_kg ?? profile?.start_weight_kg ?? null;
  const bmi = calcBmi(weight, profile?.height_cm ?? null);
  const goalBmi = calcBmi(profile?.goal_weight_kg ?? null, profile?.height_cm ?? null);
  const cat = bmiCategory(bmi);
  const goalCat = bmiCategory(goalBmi);

  const plan = profile?.plan;
  const kcal = plan?.daily_kcal ?? kcalTarget(profile);
  const protein = plan?.protein_g ?? (weight ? Math.round(1.6 * weight) : 110);
  const carbs = plan?.carbs_g ?? Math.round((kcal * 0.45) / 4);
  const fat = plan?.fat_g ?? Math.round((kcal * 0.25) / 9);

  return (
    <section className={`screen${active ? " active" : ""}`} id="s-wissen">
      <div className="scr-head">
        <h1 className="t">Wissen &amp; Fortschritt</h1>
        <div className="muted" style={{ fontSize: 13 }}>Deine Werte – wissenschaftlich fundiert.</div>
      </div>
      <div className="scr-body">
        <div className="grid">
          <Mcard active={active} icon="ic-flame" iconBg="#fde2e1" title="Kalorien" sub="Tagesziel" num={kcal} color="var(--red)" p={78} />
          <Mcard active={active} icon="ic-bolt" iconBg="#ffe9cc" title="Protein" sub="Magermasse" num={protein} suffix="g" color="var(--orange)" p={72} />
          <Mcard active={active} icon="ic-grain" iconBg="#e3f6e6" title="Kohlenhydrate" sub="Energie" num={carbs} suffix="g" color="var(--green)" p={60} />
          <Mcard active={active} icon="ic-drop" iconBg="#fff3cc" title="Fett" sub="Hormone" num={fat} suffix="g" color="var(--yellow)" p={55} />
        </div>

        <div className="card">
          <div className="cardTitle"><div className="ic"><Icon name="ic-body" /></div><h3>Body-Mass-Index</h3></div>
          <div className="bmi-row">
            <div>
              <div className="bmi-lab">BMI AKTUELL</div>
              <div className="bmi-val">{bmi != null ? de(bmi) : "—"}</div>
              <span className={`tag ${cat.tag}`}>{cat.label}</span>
            </div>
            <div style={{ alignSelf: "center", color: "#c6bca2" }}><Icon name="ic-chev" style={{ width: 20 }} /></div>
            <div style={{ textAlign: "right" }}>
              <div className="bmi-lab">BMI ZIEL</div>
              <div className="bmi-val">{goalBmi != null ? de(goalBmi) : "—"}</div>
              <span className={`tag ${goalCat.tag}`}>{goalCat.label}</span>
            </div>
          </div>
          <div className="scale"><span className="mk" style={{ left: `${bmiScalePos(bmi)}%` }} /></div>
          <div className="scale-ends"><span>15</span><span>45+</span></div>
        </div>

        <div className="card">
          <div className="cardTitle"><div className="ic"><Icon name="ic-book" /></div><h3>Medizinische Quellen</h3></div>
          {SOURCES.map((s, i) => (
            <a className="src" key={i} href={s.href} target="_blank" rel="noopener noreferrer">
              <span className="doc"><Icon name="ic-doc" /></span>
              <div><div className="a">{s.a}</div><div className="b">{s.b}</div></div>
              <span className="chev"><Icon name="ic-chev" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Mcard({
  active, icon, iconBg, title, sub, num, suffix = "", color, p,
}: {
  active: boolean; icon: string; iconBg: string; title: string; sub: string; num: number; suffix?: string; color: string; p: number;
}) {
  const [fill, setFill] = useState(0);
  const [shown, setShown] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    setTimeout(() => setFill(p), 100);
    let start: number | null = null;
    const dur = 1100;
    const tick = (t: number) => {
      if (start === null) start = t;
      const prog = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - prog, 3);
      setShown(Math.round(num * e));
      if (prog < 1) requestAnimationFrame(tick);
      else setShown(num);
    };
    requestAnimationFrame(tick);
  }, [active, num, p]);

  return (
    <div className="mcard">
      <div className="mhead">
        <div className="mi" style={{ background: iconBg }}><Icon name={icon} /></div>
        <div><div className="mt">{title}</div><div className="ms">{sub}</div></div>
      </div>
      <div className="ring" style={{ ["--p"]: fill, ["--c"]: color } as React.CSSProperties}>
        <b>{shown}{suffix}</b>
      </div>
    </div>
  );
}

function kcalTarget(p: Profile | null): number {
  if (!p?.current_weight_kg || !p?.height_cm || !p?.age) return 1800;
  const w = p.current_weight_kg, h = p.height_cm, a = p.age;
  const base = p.gender === "Mann" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  return Math.round((base * 1.3 - 400) / 10) * 10;
}

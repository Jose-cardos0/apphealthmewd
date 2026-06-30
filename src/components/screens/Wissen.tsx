"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { calcBmi, bmiCategory, bmiScalePos, de } from "@/lib/metrics";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { massValue, massSuffix } from "@/lib/units";

const TX = {
  de: {
    heading: "Wissen & Fortschritt",
    subtitle: "Deine Werte – wissenschaftlich fundiert.",
    kcalTitle: "Kalorien",
    kcalSub: "Tagesziel",
    proteinTitle: "Protein",
    proteinSub: "Magermasse",
    carbsTitle: "Kohlenhydrate",
    carbsSub: "Energie",
    fatTitle: "Fett",
    fatSub: "Hormone",
    bmiCard: "Body-Mass-Index",
    bmiCurrent: "BMI AKTUELL",
    bmiGoal: "BMI ZIEL",
    sourcesCard: "Medizinische Quellen",
    bmiLabel: (label: string) => label,
    sources: [
      { a: "Wirksamkeit & Risiken von GLP-1", b: "Nature Medicine", href: "https://www.nature.com/subjects/glp-1" },
      { a: "Die Zukunft der Adipositas-Behandlung", b: "Harvard Magazine", href: "https://www.harvardmagazine.com/topics/health-medicine" },
      { a: "Messung von Körperfett & BMI", b: "Harvard T.H. Chan", href: "https://www.hsph.harvard.edu/obesity-prevention-source/obesity-definition/" },
      { a: "Forschung zu GLP-1-Medikamenten", b: "UChicago Medicine", href: "https://www.uchicagomedicine.org/forefront/gastrointestinal-articles" },
    ],
  },
  en: {
    heading: "Knowledge & Progress",
    subtitle: "Your numbers – scientifically grounded.",
    kcalTitle: "Calories",
    kcalSub: "Daily target",
    proteinTitle: "Protein",
    proteinSub: "Lean mass",
    carbsTitle: "Carbohydrates",
    carbsSub: "Energy",
    fatTitle: "Fat",
    fatSub: "Hormones",
    bmiCard: "Body Mass Index",
    bmiCurrent: "BMI CURRENT",
    bmiGoal: "BMI GOAL",
    sourcesCard: "Medical sources",
    bmiLabel: (label: string) => {
      switch (label) {
        case "UNTERGEWICHT": return "UNDERWEIGHT";
        case "NORMALGEWICHT": return "NORMAL WEIGHT";
        case "ÜBERGEWICHT": return "OVERWEIGHT";
        case "ADIPOSITAS": return "OBESITY";
        default: return label;
      }
    },
    sources: [
      { a: "Efficacy & risks of GLP-1", b: "Nature Medicine", href: "https://www.nature.com/subjects/glp-1" },
      { a: "The future of obesity treatment", b: "Harvard Magazine", href: "https://www.harvardmagazine.com/topics/health-medicine" },
      { a: "Measuring body fat & BMI", b: "Harvard T.H. Chan", href: "https://www.hsph.harvard.edu/obesity-prevention-source/obesity-definition/" },
      { a: "Research on GLP-1 medications", b: "UChicago Medicine", href: "https://www.uchicagomedicine.org/forefront/gastrointestinal-articles" },
    ],
  },
} as const;

export default function Wissen({ active, profile }: { active: boolean; profile: Profile | null }) {
  const { lang } = useI18n();
  const t = TX[lang];
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
        <h1 className="t">{t.heading}</h1>
        <div className="muted" style={{ fontSize: 13 }}>{t.subtitle}</div>
      </div>
      <div className="scr-body">
        <div className="grid">
          <Mcard active={active} icon="ic-flame" iconBg="#f4f3f0" title={t.kcalTitle} sub={t.kcalSub} num={kcal} color="var(--red)" p={78} />
          <Mcard active={active} icon="ic-bolt" iconBg="#f4f3f0" title={t.proteinTitle} sub={t.proteinSub} num={massValue(protein, lang)} suffix={massSuffix(lang)} decimals={lang === "en" ? 1 : 0} color="var(--orange)" p={72} />
          <Mcard active={active} icon="ic-grain" iconBg="#f4f3f0" title={t.carbsTitle} sub={t.carbsSub} num={massValue(carbs, lang)} suffix={massSuffix(lang)} decimals={lang === "en" ? 1 : 0} color="var(--green)" p={60} />
          <Mcard active={active} icon="ic-drop" iconBg="#f4f3f0" title={t.fatTitle} sub={t.fatSub} num={massValue(fat, lang)} suffix={massSuffix(lang)} decimals={lang === "en" ? 1 : 0} color="var(--yellow)" p={55} />
        </div>

        <div className="card">
          <div className="cardTitle"><div className="ic"><Icon name="ic-body" /></div><h3>{t.bmiCard}</h3></div>
          <div className="bmi-row">
            <div>
              <div className="bmi-lab">{t.bmiCurrent}</div>
              <div className="bmi-val">{bmi != null ? de(bmi) : "—"}</div>
              <span className={`tag ${cat.tag}`}>{t.bmiLabel(cat.label)}</span>
            </div>
            <div style={{ alignSelf: "center", color: "#c6bca2" }}><Icon name="ic-chev" style={{ width: 20 }} /></div>
            <div style={{ textAlign: "right" }}>
              <div className="bmi-lab">{t.bmiGoal}</div>
              <div className="bmi-val">{goalBmi != null ? de(goalBmi) : "—"}</div>
              <span className={`tag ${goalCat.tag}`}>{t.bmiLabel(goalCat.label)}</span>
            </div>
          </div>
          <div className="scale"><span className="mk" style={{ left: `${bmiScalePos(bmi)}%` }} /></div>
          <div className="scale-ends"><span>15</span><span>45+</span></div>
        </div>

        <div className="card">
          <div className="cardTitle"><div className="ic"><Icon name="ic-book" /></div><h3>{t.sourcesCard}</h3></div>
          {t.sources.map((s, i) => (
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
  active, icon, iconBg, title, sub, num, suffix = "", color, p, decimals = 0,
}: {
  active: boolean; icon: string; iconBg: string; title: string; sub: string; num: number; suffix?: string; color: string; p: number; decimals?: number;
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
      setShown(num * e);
      if (prog < 1) requestAnimationFrame(tick);
      else setShown(num);
    };
    requestAnimationFrame(tick);
  }, [active, num, p]);

  const display = decimals > 0 ? shown.toFixed(decimals) : Math.round(shown).toString();

  return (
    <div className="mcard">
      <div className="mhead">
        <div className="mi" style={{ background: iconBg }}><Icon name={icon} /></div>
        <div><div className="mt">{title}</div><div className="ms">{sub}</div></div>
      </div>
      <div className="ring2">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path className="ring2-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className="ring2-fill" stroke={color} strokeDasharray={`${fill}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <b>{display}{suffix}</b>
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

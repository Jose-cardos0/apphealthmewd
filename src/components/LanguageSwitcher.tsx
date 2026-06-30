"use client";

import { useI18n, type Lang } from "@/lib/i18n";

function FlagDE() {
  return (
    <svg viewBox="0 0 5 3" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="5" height="3" y="0" fill="#000" />
      <rect width="5" height="2" y="1" fill="#D00" />
      <rect width="5" height="1" y="2" fill="#FFCE00" />
    </svg>
  );
}

function FlagEN() {
  return (
    <svg viewBox="0 0 60 30" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <clipPath id="ls-uk"><rect width="60" height="30" /></clipPath>
      <g clipPath="url(#ls-uk)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30" stroke="#C8102E" strokeWidth="4" />
        <path d="M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

const OPTIONS: { code: Lang; label: string; Flag: () => React.ReactElement }[] = [
  { code: "de", label: "Deutsch", Flag: FlagDE },
  { code: "en", label: "English", Flag: FlagEN },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch">
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          className={`lang-opt${lang === o.code ? " sel" : ""}`}
          onClick={() => setLang(o.code)}
          aria-pressed={lang === o.code}
        >
          <span className="lang-flag"><o.Flag /></span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "de" | "en";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const I18nContext = createContext<Ctx>({ lang: "de", setLang: () => {} });

/**
 * Sprach-Provider. Hält die aktuelle Sprache (de/en) und persistiert sie in
 * localStorage + Cookie (damit SSR die richtige Sprache rendern kann).
 * Die Übersetzungen selbst liegen lokal in jeder Komponente als { de, en }.
 */
export function I18nProvider({ children, initial = "de" }: { children: React.ReactNode; initial?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored === "de" || stored === "en") {
        setLangState(stored);
        document.documentElement.lang = stored;
      }
    } catch {
      /* localStorage nicht verfügbar – Standard bleibt */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Hilfstyp für lokale Wörterbücher: { de: {...}, en: {...} }. */
export type Dict<T> = Record<Lang, T>;

/**
 * Einheiten-Formatierung je nach Sprache/Region.
 * - Deutsch (de): metrisch  → Gramm (g), Liter (L), Milliliter (ml)
 * - Englisch (en, US-Markt): imperial → Unzen (oz), Flüssigunzen (fl oz)
 */

const OZ_PER_G = 0.03527396195;
const FLOZ_PER_ML = 0.0338140227;

/** Masse: Gramm → "Xg" (de) bzw. "X.X oz" / "X oz" (en). */
export function fmtMass(grams: number, lang: string): string {
  if (lang === "en") {
    const oz = grams * OZ_PER_G;
    return `${oz < 10 ? Math.round(oz * 10) / 10 : Math.round(oz)} oz`;
  }
  return `${Math.round(grams)} g`;
}

/** Reiner Massenwert (Zahl) in der Zielsprache – für animierte Anzeigen. */
export function massValue(grams: number, lang: string): number {
  if (lang === "en") return Math.round(grams * OZ_PER_G * 10) / 10;
  return Math.round(grams);
}
export function massSuffix(lang: string): string {
  return lang === "en" ? " oz" : "g";
}

/** Volumen aus Millilitern: "X ml" (de) bzw. "X fl oz" (en). */
export function fmtVolMl(ml: number, lang: string): string {
  if (lang === "en") return `${Math.round(ml * FLOZ_PER_ML)} fl oz`;
  return `${Math.round(ml)} ml`;
}

/** Volumen aus Litern: "X,X L" (de) bzw. "X fl oz" (en). */
export function fmtVolL(liters: number, lang: string): string {
  if (lang === "en") return `${Math.round(liters * 1000 * FLOZ_PER_ML)} fl oz`;
  return `${liters.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`;
}

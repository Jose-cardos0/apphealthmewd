/**
 * Einheiten-Formatierung je nach Sprache/Region.
 * - Deutsch (de): metrisch  → Gramm (g), Liter (L), Milliliter (ml)
 * - Englisch (en, US-Markt): imperial → Unzen (oz), Flüssigunzen (fl oz)
 */

const OZ_PER_G = 0.03527396195;
const FLOZ_PER_ML = 0.0338140227;
const LB_PER_KG = 2.20462262;

/** Körpergewicht: "X,X kg" (de) bzw. "X lb" (en). */
export function fmtWeight(kg: number, lang: string): string {
  if (lang === "en") return `${Math.round(kg * LB_PER_KG)} lb`;
  return `${kg.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}
export function weightUnit(lang: string): string {
  return lang === "en" ? "lb" : "kg";
}
/** kg → Anzeigewert in der Zielsprache (lb gerundet, kg mit 1 Nachkommastelle). */
export function kgToDisplay(kg: number, lang: string): number {
  return lang === "en" ? Math.round(kg * LB_PER_KG) : Math.round(kg * 10) / 10;
}
/** Eingabewert (lb oder kg) zurück nach kg für die Speicherung. */
export function displayToKg(value: number, lang: string): number {
  return lang === "en" ? value / LB_PER_KG : value;
}

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

/** Dosis-Anzeige: mg bleibt (international), nur Dezimaltrennzeichen anpassen (0,25 → 0.25 im EN). */
export function fmtDose(dose: string, lang: string): string {
  return lang === "en" ? dose.replace(",", ".") : dose;
}

/** Volumen aus Litern: "X,X L" (de) bzw. "X fl oz" (en). */
export function fmtVolL(liters: number, lang: string): string {
  if (lang === "en") return `${Math.round(liters * 1000 * FLOZ_PER_ML)} fl oz`;
  return `${liters.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`;
}

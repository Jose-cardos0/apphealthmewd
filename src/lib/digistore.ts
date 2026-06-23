import { createHash } from "crypto";

/**
 * Prüft die SHA-Signatur einer Digistore24-IPN-Benachrichtigung.
 *
 * Da Digistore24 die Signatur historisch in leicht unterschiedlichen Varianten
 * berechnet (Sortierung case-sensitiv vs. case-insensitiv, Werte HTML-decodiert
 * oder nicht), probieren wir mehrere dokumentierte Varianten durch und
 * akzeptieren, sobald EINE den übermittelten sha_sign reproduziert. Die
 * Passphrase bleibt dabei zwingend erforderlich – die Prüfung wird also nicht
 * unsicherer, nur toleranter gegenüber Formatdetails.
 */

type Variant = { sort: "ci" | "cs"; decode: boolean; upperKey: boolean };

const VARIANTS: Variant[] = [];
for (const sort of ["ci", "cs"] as const)
  for (const decode of [false, true])
    for (const upperKey of [false, true]) VARIANTS.push({ sort, decode, upperKey });

function buildShaString(
  params: Record<string, string>,
  passphrase: string,
  v: Variant,
): string {
  const keys = Object.keys(params)
    .filter((k) => k !== "sha_sign")
    .sort((a, b) => {
      const A = v.sort === "ci" ? a.toLowerCase() : a;
      const B = v.sort === "ci" ? b.toLowerCase() : b;
      return A < B ? -1 : A > B ? 1 : 0;
    });

  let s = "";
  for (const key of keys) {
    let value = params[key];
    if (value === undefined || value === null || value === "") continue;
    if (v.decode) value = htmlEntityDecode(value);
    s += `${v.upperKey ? key.toUpperCase() : key}=${value}${passphrase}`;
  }
  return s;
}

export function verifyDigistoreSignature(
  params: Record<string, string>,
  passphrase: string,
): boolean {
  const provided = params["sha_sign"];
  if (!provided) return false;
  const target = provided.toUpperCase();

  for (const v of VARIANTS) {
    const s = buildShaString(params, passphrase, v);
    const expected = createHash("sha512").update(s, "utf8").digest("hex").toUpperCase();
    if (expected === target) return true;
  }
  return false;
}

/** Liefert Diagnose-Infos (ohne Passphrase/Secrets) für die Vercel-Logs. */
export function digistoreSignatureDebug(
  params: Record<string, string>,
  passphrase: string,
) {
  const provided = (params["sha_sign"] || "").toUpperCase();
  const standard = buildShaString(params, passphrase, {
    sort: "ci",
    decode: false,
    upperKey: false,
  });
  const expected = createHash("sha512").update(standard, "utf8").digest("hex").toUpperCase();
  return {
    keys: Object.keys(params).filter((k) => k !== "sha_sign"),
    providedPrefix: provided.slice(0, 12),
    expectedPrefix: expected.slice(0, 12),
    passphraseLen: passphrase.length,
  };
}

/** Entspricht PHP html_entity_decode für die gängigsten Entities. */
function htmlEntityDecode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}

import { createHash } from "crypto";

/**
 * Prüft die SHA-Signatur einer Digistore24-IPN-Benachrichtigung.
 *
 * Algorithmus (laut Digistore24-Doku):
 *  1. Parameter "sha_sign" entfernen.
 *  2. Restliche Keys case-insensitiv (wie strcasecmp) aufsteigend sortieren.
 *  3. Leere Werte überspringen.
 *  4. Pro Key: "key=value{passphrase}" aneinanderhängen (Werte HTML-decodiert).
 *  5. SHA-512 (hex, GROSSBUCHSTABEN) bilden und mit sha_sign vergleichen.
 */
export function verifyDigistoreSignature(
  params: Record<string, string>,
  passphrase: string,
): boolean {
  const provided = params["sha_sign"];
  if (!provided) return false;

  const keys = Object.keys(params)
    .filter((k) => k !== "sha_sign")
    .sort((a, b) => {
      const la = a.toLowerCase();
      const lb = b.toLowerCase();
      return la < lb ? -1 : la > lb ? 1 : 0;
    });

  let shaString = "";
  for (const key of keys) {
    const value = params[key];
    if (value === undefined || value === null || value === "") continue;
    shaString += `${key}=${htmlEntityDecode(value)}${passphrase}`;
  }

  const expected = createHash("sha512").update(shaString, "utf8").digest("hex").toUpperCase();
  return expected === provided.toUpperCase();
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

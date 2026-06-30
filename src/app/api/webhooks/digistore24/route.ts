import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyDigistoreSignature, digistoreSignatureDebug } from "@/lib/digistore";
import { grantAccess, revokeAccess, errorMessage } from "@/lib/access";

// Webhook muss dynamisch laufen (kein Caching) und den rohen Body lesen.
export const dynamic = "force-dynamic";

/** Events, die den Zugang freischalten. */
const GRANT_EVENTS = new Set(["on_payment", "on_rebill_resumed"]);
/** Events, die den Zugang deaktivieren (Rückerstattung / Stornierung). */
const REVOKE_EVENTS = new Set([
  "on_refund",
  "on_chargeback",
  "on_rebill_cancelled",
  "on_payment_missed",
]);

export async function POST(req: NextRequest) {
  // 1) Rohen Form-Body parsen
  const raw = await req.text();
  const sp = new URLSearchParams(raw);
  const params: Record<string, string> = {};
  sp.forEach((v, k) => (params[k] = v));

  const event = params.event || "";

  // Optionales Voll-Logging des Payloads (zum Debuggen) – über Vercel-Logs sichtbar.
  // Aktivieren mit Umgebungsvariable DIGISTORE_DEBUG=1.
  if (process.env.DIGISTORE_DEBUG === "1" || process.env.DIGISTORE_DEBUG === "true") {
    console.log("[digistore24] eingehender Payload:", JSON.stringify(params, null, 2));
  }

  // 2) Verbindungstest von Digistore24 → einfach OK zurückgeben
  if (event === "connection_test" || params.connection_test) {
    console.log("[digistore24] connection_test empfangen. Felder:", Object.keys(params));
    return new Response("OK", { status: 200 });
  }

  // 3) Signatur prüfen (falls Passphrase gesetzt)
  const passphrase = process.env.DIGISTORE_PASSPHRASE;
  const skipSignature =
    process.env.DIGISTORE_SKIP_SIGNATURE === "1" ||
    process.env.DIGISTORE_SKIP_SIGNATURE === "true";

  if (skipSignature) {
    console.warn(
      "[digistore24] DIGISTORE_SKIP_SIGNATURE aktiv – Signatur wird NICHT geprüft! Nur zum Testen verwenden.",
    );
  } else if (passphrase) {
    if (!verifyDigistoreSignature(params, passphrase)) {
      // Diagnose in die Vercel-Logs schreiben (ohne Secrets)
      console.error("[digistore24] Signatur ungültig:", digistoreSignatureDebug(params, passphrase));
      console.error("[digistore24] Payload (Signatur ungültig):", JSON.stringify(params, null, 2));
      return new Response("INVALID SIGNATURE", { status: 403 });
    }
  } else {
    console.warn(
      "[digistore24] DIGISTORE_PASSPHRASE nicht gesetzt – Signatur wird NICHT geprüft!",
    );
  }

  // 4) E-Mail des Käufers ermitteln
  const email = (params.email || params.buyer_email || params.address_email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return new Response("OK (keine E-Mail)", { status: 200 });
  }

  const admin = createAdminClient();

  // 5) Kauf protokollieren (Audit) – Fehler hier sind nicht kritisch
  try {
    await admin.from("purchases").insert({
      email,
      order_id: params.order_id || null,
      event,
      product_id: params.product_id || null,
      product_name: params.product_name || null,
      raw: params,
    });
  } catch {
    /* ignoriert */
  }

  try {
    if (GRANT_EVENTS.has(event)) {
      await grantAccess(admin, email);
    } else if (REVOKE_EVENTS.has(event)) {
      await revokeAccess(admin, email);
    }
    // andere Events ignorieren wir bewusst.
  } catch (err) {
    const msg = errorMessage(err);
    console.error("[digistore24] Fehler:", msg, err);
    // Non-OK → Digistore24 versucht es erneut.
    return new Response("ERROR: " + msg, { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

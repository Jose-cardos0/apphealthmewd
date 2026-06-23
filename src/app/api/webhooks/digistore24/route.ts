import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyDigistoreSignature, digistoreSignatureDebug } from "@/lib/digistore";
import { sendWelcomeEmail } from "@/lib/email";

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

  // 2) Verbindungstest von Digistore24 → einfach OK zurückgeben
  if (event === "connection_test" || params.connection_test) {
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
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("[digistore24] Fehler:", msg);
    // Non-OK → Digistore24 versucht es erneut.
    return new Response("ERROR: " + msg, { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

type Admin = ReturnType<typeof createAdminClient>;

async function findUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const { data, error } = await admin.rpc("get_user_id_by_email", { p_email: email });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/** Käufer freischalten: neuen Nutzer anlegen + E-Mail senden, oder bestehenden reaktivieren. */
async function grantAccess(admin: Admin, email: string) {
  const existingId = await findUserIdByEmail(admin, email);

  if (existingId) {
    // Bestehender Nutzer → wieder aktivieren (Passwort bleibt unverändert)
    const { data: userRes } = await admin.auth.admin.getUserById(existingId);
    const meta = userRes?.user?.app_metadata || {};
    await admin.auth.admin.updateUserById(existingId, {
      app_metadata: { ...meta, active: true },
      ban_duration: "none",
    });
    return;
  }

  // Neuer Nutzer → mit Standard-Passwort anlegen
  const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "123456789";
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true,
    app_metadata: { must_change_password: true, active: true },
  });

  // Falls der Nutzer zwischenzeitlich doch existiert: nur reaktivieren, keine E-Mail
  if (createErr) {
    if (/already|exist|registered/i.test(createErr.message)) {
      const id = await findUserIdByEmail(admin, email);
      if (id) {
        const { data: userRes } = await admin.auth.admin.getUserById(id);
        const meta = userRes?.user?.app_metadata || {};
        await admin.auth.admin.updateUserById(id, {
          app_metadata: { ...meta, active: true },
          ban_duration: "none",
        });
      }
      return;
    }
    throw createErr;
  }

  // Willkommens-E-Mail mit Zugangsdaten senden
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  await sendWelcomeEmail({
    to: email,
    loginUrl: `${siteUrl}/login`,
    password: defaultPassword,
  });
}

/** Zugang deaktivieren (Rückerstattung / Stornierung). */
async function revokeAccess(admin: Admin, email: string) {
  const id = await findUserIdByEmail(admin, email);
  if (!id) return;

  const { data: userRes } = await admin.auth.admin.getUserById(id);
  const meta = userRes?.user?.app_metadata || {};
  await admin.auth.admin.updateUserById(id, {
    app_metadata: { ...meta, active: false },
    // Sperrt bestehende Sessions/Logins für lange Zeit
    ban_duration: "876000h",
  });
}

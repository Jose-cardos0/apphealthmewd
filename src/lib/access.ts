import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Gemeinsame Zugriffs-Logik für ALLE Checkout-Anbieter (Digistore24, CartPanda …).
 * So bleibt das Verhalten (Nutzer anlegen + Willkommens-E-Mail + Deaktivierung)
 * für jeden Webhook identisch.
 */
export type Admin = ReturnType<typeof createAdminClient>;

export async function findUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const { data, error } = await admin.rpc("get_user_id_by_email", { p_email: email });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/** Käufer freischalten: neuen Nutzer anlegen + E-Mail senden, oder bestehenden reaktivieren. */
export async function grantAccess(admin: Admin, email: string) {
  const existingId = await findUserIdByEmail(admin, email);

  if (existingId) {
    // Bestehender Nutzer → wieder aktivieren (Passwort bleibt unverändert, keine E-Mail)
    const { data: userRes } = await admin.auth.admin.getUserById(existingId);
    const meta = userRes?.user?.app_metadata || {};
    await admin.auth.admin.updateUserById(existingId, {
      app_metadata: { ...meta, active: true },
      ban_duration: "none",
    });
    return;
  }

  // Neuer Nutzer → mit Standard-Passwort anlegen.
  // trim(): unsichtbare Leerzeichen/Zeilenumbrüche aus der Env-Variable entfernen,
  // sonst stimmt das Passwort im Login nie mit der E-Mail überein.
  const defaultPassword = (process.env.DEFAULT_USER_PASSWORD || "123456789").trim();
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

  // Willkommens-E-Mail (zweisprachig DE/EN) mit Zugangsdaten senden.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  await sendWelcomeEmail({
    to: email,
    loginUrl: `${siteUrl}/login`,
    password: defaultPassword,
  });
}

/** Zugang deaktivieren (Rückerstattung / Stornierung). */
export async function revokeAccess(admin: Admin, email: string) {
  const id = await findUserIdByEmail(admin, email);
  if (!id) return;

  const { data: userRes } = await admin.auth.admin.getUserById(id);
  const meta = userRes?.user?.app_metadata || {};
  await admin.auth.admin.updateUserById(id, {
    app_metadata: { ...meta, active: false },
    ban_duration: "876000h",
  });
}

/** Extrahiert eine lesbare Fehlermeldung aus Error- ODER Supabase-Fehlerobjekten. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const parts = [o.message, o.details, o.hint, o.code].filter(Boolean).map((x) => String(x));
    if (parts.length) return parts.join(" | ");
    try {
      return JSON.stringify(err);
    } catch {
      return "Unbekannter Fehler";
    }
  }
  return "Unbekannter Fehler";
}

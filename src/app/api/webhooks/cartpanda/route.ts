import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccess, revokeAccess, errorMessage } from "@/lib/access";

// Webhook muss dynamisch laufen (kein Caching) und den rohen Body lesen.
export const dynamic = "force-dynamic";

/** CartPanda-Events, die den Zugang freischalten. */
const GRANT_EVENTS = new Set(["order.paid"]);
/** CartPanda-Events, die den Zugang deaktivieren (Rückerstattung). */
const REVOKE_EVENTS = new Set(["order.refunded"]);

type Json = Record<string, unknown>;

export async function POST(req: NextRequest) {
  // 1) JSON-Body parsen
  const rawText = await req.text();
  let body: Json = {};
  try {
    body = (JSON.parse(rawText) || {}) as Json;
  } catch {
    body = {};
  }

  // 2) Sicherheit: Shared-Secret-Token aus der URL (?token=) oder Header prüfen.
  //    In CartPanda hängst du den Token an die Webhook-URL an.
  const token = process.env.CARTPANDA_WEBHOOK_TOKEN;
  if (token) {
    const url = new URL(req.url);
    const provided =
      url.searchParams.get("token") ||
      req.headers.get("x-cartpanda-token") ||
      req.headers.get("x-webhook-token") ||
      "";
    if (provided !== token) {
      console.error("[cartpanda] Ungültiger Token – Webhook abgelehnt.");
      return new Response("INVALID TOKEN", { status: 403 });
    }
  } else {
    console.warn("[cartpanda] CARTPANDA_WEBHOOK_TOKEN nicht gesetzt – Webhook ist UNGESCHÜTZT! Nur zum Testen.");
  }

  // Optionales Voll-Logging (Debug) – mit CARTPANDA_DEBUG=1 aktivierbar.
  if (process.env.CARTPANDA_DEBUG === "1" || process.env.CARTPANDA_DEBUG === "true") {
    console.log("[cartpanda] eingehender Payload:", rawText.slice(0, 4000));
  }

  // 3) Verbindungstest / Ping einfach bestätigen
  if (body.test === true || body.ping === true) {
    return new Response("OK", { status: 200 });
  }

  // 4) Event-Namen ermitteln (aus Body oder Header)
  const event = String(
    (body.event as string) ||
      (body.type as string) ||
      req.headers.get("x-cartpanda-event") ||
      req.headers.get("x-webhook-event") ||
      "",
  ).toLowerCase();

  // 5) Käufer-E-Mail aus den möglichen Pfaden holen
  const email = extractEmail(body);
  if (!email) {
    console.warn("[cartpanda] Keine E-Mail im Payload gefunden. Event:", event);
    return new Response("OK (keine E-Mail)", { status: 200 });
  }

  // 6) Aktion bestimmen: Event-Name ODER Zahlungsstatus
  const status = statusStr(body);
  const isPaid = GRANT_EVENTS.has(event) || /paid|approved|complete|success|aprovad|pago/.test(status);
  const isRefunded = REVOKE_EVENTS.has(event) || /refund|charge.?back|cancel|estorn|reembols/.test(status);

  const admin = createAdminClient();

  // 7) Kauf protokollieren (Audit) – Fehler hier sind nicht kritisch
  try {
    await admin.from("purchases").insert({
      email,
      order_id: orderId(body),
      event: event || (isPaid ? "order.paid" : isRefunded ? "order.refunded" : "unknown"),
      product_id: pick(body, ["product_id", "product.id"]) ?? null,
      product_name: pick(body, ["product_name", "product.name", "product.title"]) ?? null,
      raw: body,
    });
  } catch {
    /* ignoriert */
  }

  try {
    if (isPaid) {
      await grantAccess(admin, email);
    } else if (isRefunded) {
      await revokeAccess(admin, email);
    }
    // andere Events (order.created/updated ohne Zahlung) bewusst ignorieren.
  } catch (err) {
    const msg = errorMessage(err);
    console.error("[cartpanda] Fehler:", msg, err);
    // Non-OK → CartPanda versucht es erneut.
    return new Response("ERROR: " + msg, { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

/** Sucht die Käufer-E-Mail in allen üblichen CartPanda-Payload-Pfaden. */
function extractEmail(b: Json): string {
  const candidates = [
    pick(b, ["email"]),
    pick(b, ["order.email"]),
    pick(b, ["customer.email"]),
    pick(b, ["order.customer.email"]),
    pick(b, ["data.email"]),
    pick(b, ["data.order.email"]),
    pick(b, ["data.customer.email"]),
    pick(b, ["data.order.customer.email"]),
    pick(b, ["buyer.email"]),
    pick(b, ["contact.email"]),
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) return c.trim().toLowerCase();
  }
  return "";
}

/** Zahlungsstatus als String aus den üblichen Pfaden. */
function statusStr(b: Json): string {
  const s =
    pick(b, ["order.payment_status"]) ??
    pick(b, ["payment_status"]) ??
    pick(b, ["order.status"]) ??
    pick(b, ["status"]) ??
    pick(b, ["data.order.payment_status"]) ??
    pick(b, ["data.order.status"]) ??
    "";
  return String(s).toLowerCase();
}

function orderId(b: Json): string | null {
  const v = pick(b, ["order_id"]) ?? pick(b, ["order.id"]) ?? pick(b, ["id"]) ?? pick(b, ["data.order.id"]);
  return v != null ? String(v) : null;
}

/** Liest einen Wert über einen Punkt-Pfad ("order.customer.email") aus einem Objekt. */
function pick(obj: unknown, paths: string[]): unknown {
  for (const path of paths) {
    let cur: unknown = obj;
    let ok = true;
    for (const key of path.split(".")) {
      if (cur && typeof cur === "object" && key in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[key];
      } else {
        ok = false;
        break;
      }
    }
    if (ok && cur != null) return cur;
  }
  return undefined;
}

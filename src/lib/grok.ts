/**
 * Serverseitiger Grok-(xAI)-Client.
 * Der API-Key bleibt auf dem Server (Umgebungsvariable GROK_API_KEY)
 * und ist niemals im Browser sichtbar.
 */

const GROK_URL = "https://api.x.ai/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GrokOptions = {
  messages: ChatMessage[];
  temperature?: number;
  jsonMode?: boolean;
};

/** Ruft Grok auf und gibt den reinen Text-Content der Antwort zurück. */
export async function callGrok({
  messages,
  temperature = 0.7,
  jsonMode = false,
}: GrokOptions): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY ist nicht konfiguriert.");
  }

  const res = await fetch(GROK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROK_MODEL || "grok-3",
      temperature,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Grok-API-Fehler ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** Wie callGrok, parst die Antwort aber als JSON. */
export async function callGrokJson<T = unknown>(
  opts: GrokOptions,
): Promise<T> {
  const content = await callGrok({ ...opts, jsonMode: true });
  return JSON.parse(content) as T;
}

/**
 * Stellt sicher, dass der Aufrufer eingeloggt ist.
 * Wird in jeder Grok-Route verwendet, damit die KI nur für zahlende
 * Mitglieder läuft.
 */
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

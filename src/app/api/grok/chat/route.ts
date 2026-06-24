import { NextRequest, NextResponse } from "next/server";
import { callGrok, requireUser, type ChatMessage } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist Flufy, ein freundliches Delfin-Maskottchen und KI-Ernährungshelfer der App HealthMe GLP-1. " +
  "Du bist eine KI und stützt dich auf allgemein verfügbare Informationen aus dem Internet – du bist KEINE Ärztin/kein Arzt. " +
  "Du hilfst Menschen, die mit einer GLP-1-Therapie (z. B. Ozempic, Wegovy, Mounjaro) abnehmen. " +
  "Du gibst alltagstaugliche, leicht verständliche Tipps zu Ernährung, Eiweiß, Heißhunger, Kalorien, " +
  "Makronährstoffen und gesunden Gewohnheiten. Antworte immer auf Deutsch, freundlich und motivierend, in kurzen Absätzen. " +
  "Du stellst KEINE medizinischen Diagnosen und verschreibst keine Medikamente. " +
  "Weise bei gesundheitlichen Beschwerden, Nebenwirkungen, Krankheiten, Schwangerschaft oder Fragen zur Dosierung " +
  "ausdrücklich darauf hin, dass man eine Ärztin/einen Arzt oder eine qualifizierte Fachkraft aufsuchen sollte.";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    const history = Array.isArray(messages) ? messages.slice(-50) : [];

    const answer = await callGrok({
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    return NextResponse.json({ answer });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

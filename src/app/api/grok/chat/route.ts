import { NextRequest, NextResponse } from "next/server";
import { callGrok, requireUser, type ChatMessage } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist Dr. Markus Feld, ein freundlicher, einfühlsamer deutscher Ernährungsberater der App HealthMe GLP-1. " +
  "Du berätst Menschen, die mit einer GLP-1-Therapie (z. B. Ozempic, Wegovy, Mounjaro) abnehmen. " +
  "Du gibst alltagstaugliche, leicht verständliche Tipps zu Ernährung, Eiweiß, Heißhunger, Kalorien, " +
  "Makronährstoffen und gesunden Gewohnheiten während der Abnahme. Antworte immer auf Deutsch, freundlich und " +
  "motivierend, in kurzen Absätzen. Du stellst KEINE medizinischen Diagnosen und verschreibst keine Medikamente. " +
  "Weise bei gesundheitlichen Beschwerden, Nebenwirkungen, Krankheiten, Schwangerschaft oder Fragen zur Dosierung " +
  "ausdrücklich darauf hin, dass eine Ärztin/ein Arzt aufgesucht werden sollte.";

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

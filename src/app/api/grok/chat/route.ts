import { NextRequest, NextResponse } from "next/server";
import { callGrok, requireUser, type ChatMessage } from "@/lib/grok";

const SYSTEM_PROMPT =
  "Du bist eine freundliche, einfühlsame deutsche KI-Ernährungsberaterin der App HealthMe. " +
  "Du gibst alltagstaugliche, leicht verständliche Tipps zu Ernährung, Kalorien, Makronährstoffen, " +
  "Lebensmitteln, Diäten und gesunden Gewohnheiten. Antworte immer auf Deutsch, freundlich und " +
  "motivierend, in kurzen Absätzen. Du stellst KEINE medizinischen Diagnosen und verschreibst nichts. " +
  "Weise bei gesundheitlichen Beschwerden, Krankheiten, Schwangerschaft oder Medikamenten ausdrücklich " +
  "darauf hin, dass eine Ärztin/ein Arzt oder eine qualifizierte Ernährungsfachkraft aufgesucht werden sollte.";

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

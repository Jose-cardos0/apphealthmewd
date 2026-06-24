import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const HOST = "exercisedb.p.rapidapi.com";

async function findId(term: string, headers: Record<string, string>): Promise<string | null> {
  const lookup = async (t: string): Promise<string | null> => {
    const r = await fetch(`https://${HOST}/exercises/name/${encodeURIComponent(t.toLowerCase())}?limit=1`, { headers });
    if (!r.ok) return null;
    const arr = await r.json();
    return Array.isArray(arr) && arr[0]?.id ? String(arr[0].id) : null;
  };
  const direct = await lookup(term);
  if (direct) return direct;
  const words = term.trim().split(/\s+/);
  if (words.length > 2) return await lookup(words.slice(-2).join(" "));
  if (words.length > 1) return await lookup(words[words.length - 1]);
  return null;
}

/**
 * Proxy für die animierten Übungs-GIFs aus der ExerciseDB.
 * Akzeptiert ?id=<exerciseId> ODER ?q=<Suchbegriff> (z. B. "squat").
 * Holt das GIF serverseitig (mit RapidAPI-Key) und cacht es aggressiv.
 */
export async function GET(req: NextRequest) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return new Response("no key", { status: 404 });
  const headers = { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST };

  const idParam = req.nextUrl.searchParams.get("id");
  const q = req.nextUrl.searchParams.get("q");

  try {
    let id = idParam && /^[a-zA-Z0-9]+$/.test(idParam) ? idParam : null;
    if (!id && q) id = await findId(q, headers);
    if (!id) return new Response("not found", { status: 404 });

    const res = await fetch(`https://${HOST}/image?exerciseId=${encodeURIComponent(id)}&resolution=180`, { headers });
    if (!res.ok) return new Response("not found", { status: 404 });
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch {
    return new Response("error", { status: 502 });
  }
}

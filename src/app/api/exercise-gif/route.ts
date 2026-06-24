import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Proxy für die animierten Übungs-GIFs aus der ExerciseDB.
 * Die ExerciseDB liefert das GIF nur über einen authentifizierten Endpoint
 * (mit RapidAPI-Key). Wir holen es serverseitig und cachen es aggressiv,
 * sodass jede Übung nur einmal abgefragt wird.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const key = process.env.RAPIDAPI_KEY;
  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) return new Response("bad id", { status: 400 });
  if (!key) return new Response("no key", { status: 404 });

  try {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(id)}&resolution=180`,
      { headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "exercisedb.p.rapidapi.com" } },
    );
    if (!res.ok) return new Response("not found", { status: 404 });
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        // GIF pro Übung ändert sich nie → lange cachen (Vercel-CDN + Browser)
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch {
    return new Response("error", { status: 502 });
  }
}

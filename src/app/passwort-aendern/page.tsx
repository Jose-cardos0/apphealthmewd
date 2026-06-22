"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import LuxBackground from "@/components/LuxBackground";

export default function PasswortAendernPage() {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pw1.length < 8) {
      setError("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }
    if (pw1 === "123456789") {
      setError("Bitte wähle ein anderes Passwort als das Standard-Passwort.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // 1) Neues Passwort setzen
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) {
      setError("Das Passwort konnte nicht geändert werden. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }

    // 2) Pflicht-Flag serverseitig entfernen (app_metadata)
    const res = await fetch("/api/account/passwort-gesetzt", { method: "POST" });
    if (!res.ok) {
      setError("Etwas ist schiefgelaufen. Bitte lade die Seite neu.");
      setLoading(false);
      return;
    }

    // 3) Session neu laden, damit die neuen Claims (must_change_password=false) greifen
    await supabase.auth.refreshSession();
    router.replace("/app");
    router.refresh();
  }

  return (
    <>
      <LuxBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="HealthMe A.I"
              width={150}
              height={94}
              priority
              className="h-24 w-auto mx-auto mb-3"
            />
            <h1 className="text-xl font-extrabold text-gray-800">Neues Passwort festlegen</h1>
            <p className="text-sm text-gray-500 mt-1">
              Aus Sicherheitsgründen musst du beim ersten Login dein Passwort ändern. 🔒
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl shadow-gold-100 p-8 space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Neues Passwort
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                className="w-full text-sm border border-gold-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Passwort wiederholen
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Neues Passwort erneut eingeben"
                className="w-full text-sm border border-gold-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-400 hover:bg-gold-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-gold-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gespeichert …" : "Passwort speichern & fortfahren"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

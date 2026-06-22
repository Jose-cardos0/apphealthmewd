"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LuxBackground from "@/components/LuxBackground";

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/passwort-zuruecksetzen`,
    });

    // Aus Datenschutzgründen immer Erfolg anzeigen (keine Konto-Enumeration)
    setSent(true);
    setLoading(false);
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
            <h1 className="text-xl font-extrabold text-gray-800">Passwort vergessen?</h1>
            <p className="text-sm text-gray-500 mt-1">
              Wir senden dir einen Link zum Zurücksetzen.
            </p>
          </div>

          {sent ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-gold-100 p-8 text-center">
              <div className="w-14 h-14 mx-auto bg-gold-100 text-gold-500 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                ✉️
              </div>
              <p className="text-sm text-gray-600">
                Falls ein Konto mit dieser E-Mail existiert, haben wir dir eine
                E-Mail mit einem Link zum Zurücksetzen geschickt.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm font-semibold text-gold-500 hover:underline"
              >
                Zurück zur Anmeldung
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-xl shadow-gold-100 p-8 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full text-sm border border-gold-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-400 hover:bg-gold-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-gold-200 transition disabled:opacity-70"
              >
                {loading ? "Wird gesendet …" : "Link senden"}
              </button>
              <p className="text-center">
                <Link href="/login" className="text-xs text-gold-400 hover:underline">
                  Zurück zur Anmeldung
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

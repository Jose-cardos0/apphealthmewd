"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LuxBackground from "@/components/LuxBackground";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("E-Mail oder Passwort ist nicht korrekt.");
      setLoading(false);
      return;
    }

    // Weiterleitung je nach Zustand (Pflicht-Passwortwechsel beim ersten Login)
    if (data.user?.app_metadata?.must_change_password === true) {
      router.replace("/passwort-aendern");
    } else {
      router.replace("/app");
    }
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
              width={180}
              height={112}
              priority
              className="h-28 w-auto mx-auto mb-3"
            />
            <p className="text-sm text-gray-500 mt-1">Deine kleine Küchenfee 🧚‍♀️</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl shadow-gold-100 p-8 space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                E-Mail
              </label>
              <div className="flex items-center gap-2 border border-gold-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-gold-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-gold-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full text-sm focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Passwort
              </label>
              <div className="flex items-center gap-2 border border-gold-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-gold-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-gold-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm focus:outline-none bg-transparent"
                />
              </div>
              <div className="text-right mt-1">
                <Link href="/passwort-vergessen" className="text-xs text-gold-400 hover:underline">
                  Passwort vergessen?
                </Link>
              </div>
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
              {loading ? "Anmelden …" : "Anmelden"}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
            Dein Zugang wird nach dem Kauf automatisch per E-Mail freigeschaltet.
            <br />
            Melde dich mit der E-Mail deiner Bestellung an.
          </p>
        </div>
      </div>
    </>
  );
}

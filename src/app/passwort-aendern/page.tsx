"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";

export default function PasswortAendernPage() {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw1.length < 8) return setError("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
    if (pw1 !== pw2) return setError("Die beiden Passwörter stimmen nicht überein.");
    if (pw1 === "123456789") return setError("Bitte wähle ein anderes Passwort als das Standard-Passwort.");

    setLoading(true);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) {
      setError("Das Passwort konnte nicht geändert werden. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/account/passwort-gesetzt", { method: "POST" });
    if (!res.ok) {
      setError("Etwas ist schiefgelaufen. Bitte lade die Seite neu.");
      setLoading(false);
      return;
    }
    await supabase.auth.refreshSession();
    router.replace("/onboarding");
    router.refresh();
  }

  return (
    <div className="login">
      <AuthDecor />
      <div className="lg-inner">
        <div className="lg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lg-logo" src="/logo.png" alt="HealthMe GLP-1" />
          <p className="lg-sub">🔒 Lege zum Schutz deines Kontos beim ersten Login ein neues Passwort fest.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="lg-field">
            <div className="lg-label">Neues Passwort</div>
            <div className="lg-input">
              <Icon name="ic-lock" />
              <input type="password" autoComplete="new-password" placeholder="Mindestens 8 Zeichen" value={pw1} onChange={(e) => setPw1(e.target.value)} />
            </div>
          </div>
          <div className="lg-field">
            <div className="lg-label">Passwort wiederholen</div>
            <div className="lg-input">
              <Icon name="ic-lock" />
              <input type="password" autoComplete="new-password" placeholder="Erneut eingeben" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
          </div>

          {error && <div className="lg-err">{error}</div>}

          <button className="lg-btn" type="submit" disabled={loading}>
            <span className="sweep" />
            {loading ? "Wird gespeichert …" : "Passwort speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}

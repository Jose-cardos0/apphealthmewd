"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";

export default function PasswortZuruecksetzenPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw1.length < 8) return setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
    if (pw1 !== pw2) return setError("Die beiden Passwörter stimmen nicht überein.");

    setLoading(true);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) {
      setError("Das Passwort konnte nicht gesetzt werden. Bitte fordere den Link erneut an.");
      setLoading(false);
      return;
    }
    await fetch("/api/account/passwort-gesetzt", { method: "POST" }).catch(() => {});
    await supabase.auth.refreshSession();
    router.replace("/app");
    router.refresh();
  }

  return (
    <div className="login">
      <AuthDecor />
      <div className="lg-inner">
        <div className="lg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lg-logo" src="/logo.png" alt="HealthMe GLP-1" />
          <p className="lg-sub">Lege jetzt dein neues Passwort fest.</p>
        </div>

        {!ready ? (
          <p className="lg-sub" style={{ textAlign: "center" }}>Bitte öffne diese Seite über den Link aus deiner E-Mail.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

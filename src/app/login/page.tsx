"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";
import InstallButton from "@/components/InstallButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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

    const meta = data.user?.app_metadata || {};
    if (meta.must_change_password === true) router.replace("/passwort-aendern");
    else if (meta.onboarding_completed !== true) router.replace("/onboarding");
    else router.replace("/app");
    router.refresh();
  }

  return (
    <div className="login">
      <AuthDecor />
        <div className="lg-inner">
          <div className="lg-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lg-logo" src="/logo.png" alt="HealthMe GLP-1" />
            <p className="lg-sub">Deine smarte Begleitung auf dem Weg zum Wunschgewicht.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <div className="lg-label">E-Mail</div>
              <div className="lg-input">
                <Icon name="ic-mail" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                />
              </div>
            </div>

            <div className="lg-field">
              <div className="lg-label">Passwort</div>
              <div className="lg-input">
                <Icon name="ic-lock" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <span className="eye" onClick={() => setShowPw((v) => !v)} role="button" aria-label="Passwort anzeigen">
                  <Icon name="ic-eye" />
                </span>
              </div>
            </div>

            <div className="lg-forgot">
              <a onClick={() => router.push("/passwort-vergessen")}>Passwort vergessen?</a>
            </div>

            {error && <div className="lg-err">{error}</div>}

            <button className="lg-btn" type="submit" disabled={loading}>
              <span className="sweep" />
              {loading ? "Anmelden …" : "Anmelden"}
            </button>
          </form>

          <p className="lg-foot">
            Dein Zugang wird nach dem Kauf automatisch per E-Mail freigeschaltet.
            <br />
            Melde dich mit der E-Mail deiner Bestellung an.
          </p>

          <InstallButton />
        </div>
      </div>
  );
}

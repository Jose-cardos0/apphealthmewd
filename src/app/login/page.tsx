"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";
import InstallButton from "@/components/InstallButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

const TX = {
  de: {
    sub: "Deine smarte Begleitung auf dem Weg zum Wunschgewicht.",
    email: "E-Mail",
    emailPh: "deine@email.de",
    password: "Passwort",
    forgot: "Passwort vergessen?",
    error: "E-Mail oder Passwort ist nicht korrekt.",
    signIn: "Anmelden",
    signingIn: "Anmelden …",
    showPw: "Passwort anzeigen",
    foot1: "Dein Zugang wird nach dem Kauf automatisch per E-Mail freigeschaltet.",
    foot2: "Melde dich mit der E-Mail deiner Bestellung an.",
  },
  en: {
    sub: "Your smart companion on the way to your goal weight.",
    email: "Email",
    emailPh: "your@email.com",
    password: "Password",
    forgot: "Forgot password?",
    error: "Email or password is incorrect.",
    signIn: "Sign in",
    signingIn: "Signing in …",
    showPw: "Show password",
    foot1: "Your access is unlocked automatically by email after purchase.",
    foot2: "Sign in with the email from your order.",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
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
      setError(t.error);
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
            <LanguageSwitcher />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <div className="lg-label">{t.email}</div>
              <div className="lg-input">
                <Icon name="ic-mail" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPh}
                />
              </div>
            </div>

            <div className="lg-field">
              <div className="lg-label">{t.password}</div>
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
                <span className="eye" onClick={() => setShowPw((v) => !v)} role="button" aria-label={t.showPw}>
                  <Icon name="ic-eye" />
                </span>
              </div>
            </div>

            <div className="lg-forgot">
              <a onClick={() => router.push("/passwort-vergessen")}>{t.forgot}</a>
            </div>

            {error && <div className="lg-err">{error}</div>}

            <button className="lg-btn" type="submit" disabled={loading}>
              <span className="sweep" />
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>

          <InstallButton />
        </div>
      </div>
  );
}

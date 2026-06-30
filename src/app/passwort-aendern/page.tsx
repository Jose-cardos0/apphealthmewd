"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";
import { useI18n } from "@/lib/i18n";

const TX = {
  de: {
    sub: "Lege zum Schutz deines Kontos beim ersten Login ein neues Passwort fest.",
    newPassword: "Neues Passwort",
    repeatPassword: "Passwort wiederholen",
    minPh: "Mindestens 8 Zeichen",
    repeatPh: "Erneut eingeben",
    save: "Passwort speichern",
    saving: "Wird gespeichert …",
    errTooShort: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
    errMismatch: "Die beiden Passwörter stimmen nicht überein.",
    errDefault: "Bitte wähle ein anderes Passwort als das Standard-Passwort.",
    errUpdate: "Das Passwort konnte nicht geändert werden. Bitte versuche es erneut.",
    errGeneric: "Etwas ist schiefgelaufen. Bitte lade die Seite neu.",
  },
  en: {
    sub: "Set a new password to protect your account on your first login.",
    newPassword: "New password",
    repeatPassword: "Repeat password",
    minPh: "At least 8 characters",
    repeatPh: "Enter again",
    save: "Save password",
    saving: "Saving …",
    errTooShort: "The new password must be at least 8 characters long.",
    errMismatch: "The two passwords don't match.",
    errDefault: "Please choose a different password than the default one.",
    errUpdate: "The password couldn't be changed. Please try again.",
    errGeneric: "Something went wrong. Please reload the page.",
  },
} as const;

export default function PasswortAendernPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw1.length < 8) return setError(t.errTooShort);
    if (pw1 !== pw2) return setError(t.errMismatch);
    if (pw1 === "123456789") return setError(t.errDefault);

    setLoading(true);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) {
      setError(t.errUpdate);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/account/passwort-gesetzt", { method: "POST" });
    if (!res.ok) {
      setError(t.errGeneric);
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
          <p className="lg-sub">{t.sub}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="lg-field">
            <div className="lg-label">{t.newPassword}</div>
            <div className="lg-input">
              <Icon name="ic-lock" />
              <input type="password" autoComplete="new-password" placeholder={t.minPh} value={pw1} onChange={(e) => setPw1(e.target.value)} />
            </div>
          </div>
          <div className="lg-field">
            <div className="lg-label">{t.repeatPassword}</div>
            <div className="lg-input">
              <Icon name="ic-lock" />
              <input type="password" autoComplete="new-password" placeholder={t.repeatPh} value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
          </div>

          {error && <div className="lg-err">{error}</div>}

          <button className="lg-btn" type="submit" disabled={loading}>
            <span className="sweep" />
            {loading ? t.saving : t.save}
          </button>
        </form>
      </div>
    </div>
  );
}

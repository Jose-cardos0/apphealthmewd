"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";
import { useI18n } from "@/lib/i18n";

const TX = {
  de: {
    sub: "Lege jetzt dein neues Passwort fest.",
    openViaLink: "Bitte öffne diese Seite über den Link aus deiner E-Mail.",
    newPassword: "Neues Passwort",
    repeatPassword: "Passwort wiederholen",
    minPh: "Mindestens 8 Zeichen",
    repeatPh: "Erneut eingeben",
    save: "Passwort speichern",
    saving: "Wird gespeichert …",
    errTooShort: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    errMismatch: "Die beiden Passwörter stimmen nicht überein.",
    errUpdate: "Das Passwort konnte nicht gesetzt werden. Bitte fordere den Link erneut an.",
  },
  en: {
    sub: "Set your new password now.",
    openViaLink: "Please open this page using the link from your email.",
    newPassword: "New password",
    repeatPassword: "Repeat password",
    minPh: "At least 8 characters",
    repeatPh: "Enter again",
    save: "Save password",
    saving: "Saving …",
    errTooShort: "The password must be at least 8 characters long.",
    errMismatch: "The two passwords don't match.",
    errUpdate: "The password couldn't be set. Please request the link again.",
  },
} as const;

export default function PasswortZuruecksetzenPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
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
    if (pw1.length < 8) return setError(t.errTooShort);
    if (pw1 !== pw2) return setError(t.errMismatch);

    setLoading(true);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) {
      setError(t.errUpdate);
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
          <p className="lg-sub">{t.sub}</p>
        </div>

        {!ready ? (
          <p className="lg-sub" style={{ textAlign: "center" }}>{t.openViaLink}</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";
import { useI18n } from "@/lib/i18n";

const TX = {
  de: {
    sub: "Wir senden dir einen Link zum Zurücksetzen deines Passworts.",
    sentMsg: "Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link geschickt.",
    backToLogin: "Zurück zur Anmeldung",
    email: "E-Mail",
    emailPh: "deine@email.de",
    sendLink: "Link senden",
    sending: "Wird gesendet …",
  },
  en: {
    sub: "We'll send you a link to reset your password.",
    sentMsg: "If an account with this email exists, we've sent you a link.",
    backToLogin: "Back to sign in",
    email: "Email",
    emailPh: "your@email.com",
    sendLink: "Send link",
    sending: "Sending …",
  },
} as const;

export default function PasswortVergessenPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/passwort-zuruecksetzen`,
    });
    setSent(true);
    setLoading(false);
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

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div className="qz-ico" style={{ margin: "0 auto 14px" }}><MailCheck size={28} /></div>
            <p className="lg-sub" style={{ maxWidth: 320 }}>
              {t.sentMsg}
            </p>
            <button className="lg-btn" onClick={() => router.push("/login")}>{t.backToLogin}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <div className="lg-label">{t.email}</div>
              <div className="lg-input">
                <Icon name="ic-mail" />
                <input type="email" required autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button className="lg-btn" type="submit" disabled={loading}>
              <span className="sweep" />
              {loading ? t.sending : t.sendLink}
            </button>
            <div className="lg-forgot" style={{ textAlign: "center", marginTop: 16 }}>
              <a onClick={() => router.push("/login")}>{t.backToLogin}</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

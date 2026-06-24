"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import Icon from "@/components/Icon";

export default function PasswortVergessenPage() {
  const router = useRouter();
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
          <p className="lg-sub">Wir senden dir einen Link zum Zurücksetzen deines Passworts.</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div className="qz-ico" style={{ margin: "0 auto 14px" }}><MailCheck size={28} /></div>
            <p className="lg-sub" style={{ maxWidth: 320 }}>
              Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link geschickt.
            </p>
            <button className="lg-btn" onClick={() => router.push("/login")}>Zurück zur Anmeldung</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <div className="lg-label">E-Mail</div>
              <div className="lg-input">
                <Icon name="ic-mail" />
                <input type="email" required autoComplete="email" placeholder="deine@email.de" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button className="lg-btn" type="submit" disabled={loading}>
              <span className="sweep" />
              {loading ? "Wird gesendet …" : "Link senden"}
            </button>
            <div className="lg-forgot" style={{ textAlign: "center", marginTop: 16 }}>
              <a onClick={() => router.push("/login")}>Zurück zur Anmeldung</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

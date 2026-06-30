"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";
import { useI18n } from "@/lib/i18n";

const TX = {
  de: {
    title: "Zugang deaktiviert",
    body: "Dein Zugang zu HealthMe GLP-1 ist aktuell nicht aktiv. Das kann nach einer Rückerstattung oder Stornierung deiner Bestellung passieren. Wenn du denkst, dass das ein Fehler ist, melde dich bitte bei unserem Support.",
    logout: "Abmelden",
  },
  en: {
    title: "Access deactivated",
    body: "Your access to HealthMe GLP-1 isn't active right now. This can happen after a refund or cancellation of your order. If you think this is a mistake, please reach out to our support.",
    logout: "Sign out",
  },
} as const;

export default function KontoDeaktiviertPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="login">
      <AuthDecor />
      <div className="lg-inner" style={{ textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lg-logo" src="/logo.png" alt="HealthMe GLP-1" />
        <div className="qz-ico" style={{ margin: "10px auto 14px" }}><Lock size={28} /></div>
        <h2 className="qz-q" style={{ fontSize: 22 }}>{t.title}</h2>
        <p className="lg-sub" style={{ maxWidth: 320 }}>
          {t.body}
        </p>
        <button className="lg-btn" onClick={logout}>{t.logout}</button>
      </div>
    </div>
  );
}

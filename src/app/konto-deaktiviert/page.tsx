"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthDecor from "@/components/AuthDecor";

export default function KontoDeaktiviertPage() {
  const router = useRouter();

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
        <h2 className="qz-q" style={{ fontSize: 22 }}>Zugang deaktiviert</h2>
        <p className="lg-sub" style={{ maxWidth: 320 }}>
          Dein Zugang zu HealthMe GLP-1 ist aktuell nicht aktiv. Das kann nach einer
          Rückerstattung oder Stornierung deiner Bestellung passieren. Wenn du denkst,
          dass das ein Fehler ist, melde dich bitte bei unserem Support.
        </p>
        <button className="lg-btn" onClick={logout}>Abmelden</button>
      </div>
    </div>
  );
}

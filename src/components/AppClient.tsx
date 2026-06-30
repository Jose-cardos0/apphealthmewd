"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/Icon";
import Dashboard from "@/components/screens/Dashboard";
import Nutrition from "@/components/screens/Nutrition";
import Coach from "@/components/screens/Coach";
import Scan from "@/components/screens/Scan";
import Community from "@/components/screens/Community";
import Wissen from "@/components/screens/Wissen";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type Screen = "dashboard" | "nutrition" | "coach" | "scan" | "community" | "wissen";

const TABS: { key: Screen; icon: string }[] = [
  { key: "dashboard", icon: "ic-home" },
  { key: "nutrition", icon: "ic-chat" },
  { key: "coach", icon: "ic-dumbbell" },
  { key: "scan", icon: "ic-camai" },
  { key: "community", icon: "ic-users" },
  { key: "wissen", icon: "ic-book" },
];

const TX = {
  de: { dashboard: "Start", nutrition: "Ernährung", coach: "Coach", scan: "Scan", community: "Community", wissen: "Wissen", logout: "Abmelden" },
  en: { dashboard: "Home", nutrition: "Nutrition", coach: "Coach", scan: "Scan", community: "Community", wissen: "Knowledge", logout: "Sign out" },
} as const;

export default function AppClient({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const { lang } = useI18n();
  const t = TX[lang];
  const [screen, setScreen] = useState<Screen>("dashboard");

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="appshell">
      <div className="app">
        <Dashboard active={screen === "dashboard"} profile={profile} onScan={() => setScreen("scan")} />
        <Nutrition active={screen === "nutrition"} profile={profile} />
        <Coach active={screen === "coach"} profile={profile} />
        <Scan active={screen === "scan"} profile={profile} />
        <Community active={screen === "community"} profile={profile} />
        <Wissen active={screen === "wissen"} profile={profile} />
      </div>

      <nav className="tabbar">
        <div className="nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HealthMe GLP-1" />
        </div>

        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab${tab.key === "scan" ? " scan-tab" : ""}${screen === tab.key ? " active" : ""}`}
            onClick={() => setScreen(tab.key)}
          >
            <Icon name={tab.icon} />
            <span>{t[tab.key]}</span>
          </button>
        ))}

        <button className="nav-logout" onClick={logout}>
          <Icon name="ic-logout" />
          <span>{t.logout}</span>
        </button>
      </nav>

      {/* Schwebender Scan-Button (nur mobil) */}
      <button
        className={`scan-fab${screen === "scan" ? " active" : ""}`}
        onClick={() => setScreen("scan")}
        aria-label="Scan"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="scan-fab-img" src="/prato.png" alt="" />
        <span className="scan-fab-cam"><Icon name="ic-cam" /></span>
      </button>
    </div>
  );
}

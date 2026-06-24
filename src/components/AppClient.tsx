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

type Screen = "dashboard" | "nutrition" | "coach" | "scan" | "community" | "wissen";

const TABS: { key: Screen; label: string; icon: string }[] = [
  { key: "dashboard", label: "Start", icon: "ic-home" },
  { key: "nutrition", label: "Ernährung", icon: "ic-chat" },
  { key: "coach", label: "Coach", icon: "ic-dumbbell" },
  { key: "scan", label: "Scan", icon: "ic-camai" },
  { key: "community", label: "Community", icon: "ic-users" },
  { key: "wissen", label: "Wissen", icon: "ic-book" },
];

export default function AppClient({ profile }: { profile: Profile | null }) {
  const router = useRouter();
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

        {TABS.map((t) =>
          t.key === "scan" ? (
            <button
              key={t.key}
              className={`tab fab${screen === t.key ? " active" : ""}`}
              onClick={() => setScreen(t.key)}
            >
              <span className="fab-btn">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="fab-img" src="/prato.png" alt="" />
                <Icon name="ic-cam" className="i fab-svg" />
              </span>
              <span className="spark">
                <Icon name="ic-cam" />
              </span>
              <span>{t.label}</span>
            </button>
          ) : (
            <button
              key={t.key}
              className={`tab${screen === t.key ? " active" : ""}`}
              onClick={() => setScreen(t.key)}
            >
              <Icon name={t.icon} />
              <span>{t.label}</span>
            </button>
          ),
        )}

        <button className="nav-logout" onClick={logout}>
          <Icon name="ic-logout" />
          <span>Abmelden</span>
        </button>
      </nav>
    </div>
  );
}

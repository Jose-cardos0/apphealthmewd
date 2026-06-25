"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, MoreVertical } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop";

/** Dezenter Button zum Installieren der PWA. Immer sichtbar (außer wenn schon installiert). */
export default function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    const ua = window.navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");
    else if (/android/i.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setInstalled(true);
      return;
    }
    setHintOpen((v) => !v);
  }

  return (
    <div className="install-wrap">
      <button type="button" className="install-btn" onClick={handleClick}>
        <Download size={15} /> App installieren
      </button>
      {hintOpen && !deferred && (
        <div className="install-ios">
          {platform === "ios" ? (
            <>Tippe in Safari auf <Share size={13} /> und dann auf <strong>„Zum Home-Bildschirm“</strong> <Plus size={13} />.</>
          ) : platform === "android" ? (
            <>Tippe oben rechts auf <MoreVertical size={13} /> und dann auf <strong>„App installieren“</strong>.</>
          ) : (
            <>Klicke in der Adressleiste deines Browsers auf das <strong>Installieren-Symbol</strong> <Download size={13} />.</>
          )}
        </div>
      )}
    </div>
  );
}

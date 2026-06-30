"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, MoreVertical } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop";

const TX = {
  de: { install: "App installieren", iosPre: "Tippe in Safari auf", iosMid: "und dann auf", iosStrong: "„Zum Home-Bildschirm“", androidPre: "Tippe oben rechts auf", androidMid: "und dann auf", androidStrong: "„App installieren“", desktopPre: "Klicke in der Adressleiste deines Browsers auf das", desktopStrong: "Installieren-Symbol" },
  en: { install: "Install app", iosPre: "In Safari tap", iosMid: "and then", iosStrong: "“Add to Home Screen”", androidPre: "Tap the menu top right", androidMid: "and then", androidStrong: "“Install app”", desktopPre: "Click the", desktopStrong: "install icon", desktopPost: "in your browser's address bar." },
} as const;

/** Dezenter Button zum Installieren der PWA. Immer sichtbar (außer wenn schon installiert). */
export default function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [hintOpen, setHintOpen] = useState(false);
  const { lang } = useI18n();
  const t = TX[lang];

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
        <Download size={15} /> {t.install}
      </button>
      {hintOpen && !deferred && (
        <div className="install-ios">
          {platform === "ios" ? (
            <>{t.iosPre} <Share size={13} /> {t.iosMid} <strong>{t.iosStrong}</strong> <Plus size={13} />.</>
          ) : platform === "android" ? (
            <>{t.androidPre} <MoreVertical size={13} /> {t.androidMid} <strong>{t.androidStrong}</strong>.</>
          ) : (
            <>{t.desktopPre} <strong>{t.desktopStrong}</strong> <Download size={13} />{lang === "en" ? " " + TX.en.desktopPost : "."}</>
          )}
        </div>
      )}
    </div>
  );
}

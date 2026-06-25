"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Dezenter Button zum Installieren der PWA (Android/Chrome via Prompt, iOS via Hinweis). */
export default function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // schon installiert

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    if (ios) {
      setIsIos(true);
      setShow(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    const onInstalled = () => setShow(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setShow(false);
    } else if (isIos) {
      setIosOpen((v) => !v);
    }
  }

  return (
    <div className="install-wrap">
      <button type="button" className="install-btn" onClick={handleClick}>
        <Download size={15} /> App installieren
      </button>
      {isIos && iosOpen && (
        <div className="install-ios">
          Tippe auf <Share size={13} /> und dann auf <strong>„Zum Home-Bildschirm“</strong> <Plus size={13} />.
        </div>
      )}
    </div>
  );
}

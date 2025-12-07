"use client";

import { useEffect, useState } from "react";
import { getTranslation, type Language } from "@/lib/translations";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptProps {
  appName: string;
  language?: Language;
}

export function InstallPrompt({ appName, language = 'pt' }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detecta iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detecta se já está instalado (modo standalone)
    const standalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");
    
    setIsStandalone(standalone);

    console.log('[InstallPrompt] Debug:', {
      iOS,
      standalone,
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia("(display-mode: standalone)").matches
    });

    // Para Android/Chrome
    const handler = (e: Event) => {
      console.log('[InstallPrompt] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Para iOS, mostra o prompt se não estiver instalado e não foi dispensado
    if (iOS && !standalone) {
      const storageKey = `installPromptDismissed_${appName}`;
      const dismissed = localStorage.getItem(storageKey);
      console.log('[InstallPrompt] iOS check:', { storageKey, dismissed });
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [appName]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const storageKey = `installPromptDismissed_${appName}`;
    localStorage.setItem(storageKey, "true");
  };

  if (!showPrompt || isStandalone) return null;

  // Banner para iOS com instruções
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-2xl z-50 animate-slide-up">
        <div className="container mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-1"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{getTranslation(language, 'installApp', appName)}</p>
                <p className="text-xs opacity-90 mb-2">
                  {getTranslation(language, 'iosInstruction')}{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>{" "}
                  {getTranslation(language, 'iosAction')}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner para Android/Chrome com botão de instalação
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <div>
            <p className="font-semibold text-sm">{getTranslation(language, 'installApp', appName)}</p>
            <p className="text-xs opacity-90">{getTranslation(language, 'accessFaster')}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {getTranslation(language, 'notNow')}
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all shadow-md"
          >
            {getTranslation(language, 'install')}
          </button>
        </div>
      </div>
    </div>
  );
}

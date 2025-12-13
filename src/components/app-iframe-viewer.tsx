"use client";

import { useState, useEffect } from "react";
import { TApp } from "@/lib/drizzle/schemas/apps";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InstallPrompt } from "@/components/app/install-prompt";
import Script from "next/script";

interface AppIframeViewerProps {
  app: TApp;
}

export function AppIframeViewer({ app }: AppIframeViewerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Registra Service Worker para PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration);
          console.log('[SW] Scope:', registration.scope);
          console.log('[SW] Active:', registration.active);
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    } else {
      console.warn('[SW] Service Workers not supported');
    }

    // Verifica se o manifest está acessível
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      console.log('[Manifest] Link found:', manifestLink.getAttribute('href'));
    } else {
      console.warn('[Manifest] No manifest link found in document');
    }
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    toast.error("Erro ao carregar app", {
      description: "Não foi possível carregar o conteúdo do app.",
    });
  };

  return (
    <div className="relative h-screen w-screen flex flex-col">
      {/* add to head */}

      <Script strategy="beforeInteractive" src="https://unpkg.com/@ungap/custom-elements-builtin"></Script>
      <Script strategy="beforeInteractive" src="https://app.blackapps.online/x-iframe.js" type="module"></Script>
      {/* Header com controles */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => router.back()}
              title="Voltar"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <img
                src={app.imageUrl}
                alt={app.name}
                className="h-8 w-8 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <span className="font-semibold text-xl">{app.name}</span>
            </div>
          </div>

          <div className="flex items-center p-1">
            <HomeIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-40">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Carregando {app.name}...
            </p>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        is="x-frame-bypass"
        src={app.embbedUrl}
        className="w-full h-full border-0 pt-[52px]"
        title={app.name}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />

      {/* Install Prompt Banner */}
      <InstallPrompt
        appName={app.name}
        language={(app.language || 'pt') as 'pt' | 'en' | 'es' | 'fr' | 'de'}
      />
    </div>
  );
}

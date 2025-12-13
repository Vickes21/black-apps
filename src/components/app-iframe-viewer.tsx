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

  // Registra x-frame-bypass custom element
  useEffect(() => {
    if (!customElements.get('x-frame-bypass')) {
      customElements.define('x-frame-bypass', class extends HTMLIFrameElement {
        static get observedAttributes() {
          return ['src']
        }
        constructor() {
          super()
        }
        attributeChangedCallback() {
          this.load(this.src)
        }
        connectedCallback() {
          this.sandbox = '' + this.sandbox || 'allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation'
        }
        load(url: string, options?: any) {
          if (!url) return
          if (!url.startsWith('http')) throw new Error(`X-Frame-Bypass src ${url} does not start with http(s)://`)
          console.log('X-Frame-Bypass loading:', url)
          this.srcdoc = `<!DOCTYPE html>
<html>
<head>
  <style>
  .loader {
    position: absolute;
    top: calc(50% - 25px);
    left: calc(50% - 25px);
    width: 50px;
    height: 50px;
    background-color: #333;
    border-radius: 50%;  
    animation: loader 1s infinite ease-in-out;
  }
  @keyframes loader {
    0% {
    transform: scale(0);
    }
    100% {
    transform: scale(1);
    opacity: 0;
    }
  }
  </style>
</head>
<body>
  <div class="loader"></div>
</body>
</html>`
          this.fetchProxy(url, options, 0).then(res => res.text()).then(data => {
            if (data) this.srcdoc = data.replace(/<head([^>]*)>/i, `<head$1>
  <base href="${url}">
  <script>
  document.addEventListener('click', e => {
    if (frameElement && document.activeElement && document.activeElement.href) {
      e.preventDefault()
      frameElement.load(document.activeElement.href)
    }
  })
  document.addEventListener('submit', e => {
    if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) {
      e.preventDefault()
      if (document.activeElement.form.method === 'post') frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)})
      else frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form)))
    }
  })
  </script>`).replace(/ crossorigin=['"][^'"]*['"]/gi, '')
          }).catch(e => console.error('Cannot load X-Frame-Bypass:', e))
        }
        fetchProxy(url: string, options: any, i: number): Promise<Response> {
          const proxies = (options || {}).proxies || [
            'https://proxy.blackapps.online?url=',
          ]
          return fetch(proxies[i] + encodeURIComponent(url), options).then(res => {
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res
          }).catch(error => {
            if (i === proxies.length - 1) throw error
            return this.fetchProxy(url, options, i + 1)
          })
        }
      } as any, { extends: 'iframe' })
    }
  }, [])

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
      <Script strategy="beforeInteractive" src="https://unpkg.com/@ungap/custom-elements-builtin"></Script>
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

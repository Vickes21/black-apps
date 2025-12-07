"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppIframeViewer } from "@/components/app-iframe-viewer";
import { TApp } from "@/lib/drizzle/schemas";

export default function AppPage() {
  const params = useParams();
  const id = params?.id as string;
  const [app, setApp] = useState<TApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  console.log("AppPage - params:", params);
  console.log("AppPage - id:", id);

  useEffect(() => {
    console.log("useEffect triggered for id:", id);
    
    if (!id) {
      console.log("No id, skipping fetch");
      return;
    }

    const fetchApp = async () => {
      console.log("Starting fetch for id:", id);
      setIsLoading(true);
      try {
        // Usa URL absoluta para evitar problemas com proxy do Cloudflare Worker
        const baseUrl = window.location.origin;
        const apiUrl = `${baseUrl}/api/apps/public/${id}`;
        
        console.log("Fetching from:", apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'X-Requested-From': 'app-page',
          },
        });
        console.log("Response received:", response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("NOT_FOUND");
          }
          throw new Error("Failed to fetch app");
        }
        
        const data = await response.json();
        console.log("Data received:", data);
        setApp(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  console.log("Render state:", { isLoading, error, hasData: !!app });

  if (isLoading || !app) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return <AppIframeViewer app={app} />;
}

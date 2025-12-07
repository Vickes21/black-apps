"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AppIframeViewer } from "@/components/app-iframe-viewer";
import { TApp } from "@/lib/drizzle/schemas";

export default function AppPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: app, isLoading } = useQuery<TApp>({
    queryKey: ["public-app", id],
    queryFn: async () => {
      const response = await fetch(`/api/apps/public/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("NOT_FOUND");
        throw new Error("Failed to fetch app");
      }
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading || !app) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return <AppIframeViewer app={app} />;
}

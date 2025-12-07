"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AppIframeViewer } from "@/components/app-iframe-viewer";
import { TApp } from "@/lib/drizzle/schemas";

export default function AppPage() {
  const params = useParams();
  const id = params?.id as string;

  console.log("AppPage - params:", params);
  console.log("AppPage - id:", id);
  console.log("AppPage - !!id:", !!id);
  console.log("AppPage - typeof id:", typeof id);

  const { data: app, isLoading, error, isError, fetchStatus } = useQuery<TApp>({
    queryKey: ["public-app", id],
    queryFn: async () => {
      console.log("Query executing for id:", id);
      try {
        const response = await fetch(`/api/apps/public/${id}`);
        console.log("Response received:", response.status);
        if (!response.ok) {
          if (response.status === 404) throw new Error("NOT_FOUND");
          throw new Error("Failed to fetch app");
        }
        const data = await response.json();
        console.log("Data received:", data);
        return data;
      } catch (err) {
        console.error("Query error:", err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 0,
  });

  console.log("Query state:", { isLoading, isError, error, hasData: !!app, fetchStatus });

  if (isLoading || !app) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return <AppIframeViewer app={app} />;
}

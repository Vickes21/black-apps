"use client";

import { useQuery } from "@tanstack/react-query";
import { redirect, notFound, useParams } from "next/navigation";
import { EditAppForm } from "@/components/edit-app-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { TApp, TDomain } from "@/lib/drizzle/schemas";

interface AppData {
  app: TApp;
  domains: TDomain[];
}

export default function EditAppPage() {
  const { isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery<AppData>({
    queryKey: ["app", id, "with-domains"],
    queryFn: async () => {
      const response = await fetch(`/api/apps/${id}/with-domains`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("NOT_FOUND");
        throw new Error("Failed to fetch app");
      }
      return response.json();
    },
    enabled: isSignedIn && !!id,
  });

  if (error?.message === "NOT_FOUND") {
    notFound();
  }

  if (isLoading || !isLoaded || !data) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  const { app, domains } = data;

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/apps">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Apps
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar App</h1>
          <p className="text-muted-foreground">
            Atualize as informações do seu app
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <EditAppForm app={app} domains={domains} />
        </div>
      </div>
    </div>
  );
}

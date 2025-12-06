"use client";

import { useQuery } from "@tanstack/react-query";
import { AppCard } from "@/components/app-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { TApp } from "@/lib/drizzle/schemas";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AppsPage() {
  const { isLoaded, isSignedIn } = useUser();

  const { data: apps = [], isLoading } = useQuery<TApp[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      const response = await fetch("/api/apps");
      if (!response.ok) throw new Error("Failed to fetch apps");
      return response.json();
    },
    enabled: isSignedIn,
  });

  if (isLoaded && !isSignedIn) {
    redirect("/sign-in");
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Apps</h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus aplicativos
            </p>
          </div>
          <Button asChild>
            <Link href="/apps/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo App
            </Link>
          </Button>
        </div>

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">
                Nenhum app cadastrado
              </h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Você ainda não criou nenhum app. Comece criando seu primeiro
                app agora.
              </p>
              <Button asChild>
                <Link href="/apps/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Primeiro App
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { CreateAppForm } from '@/components/create-app-form';
import { useUser } from "@clerk/nextjs";
import { TDomain } from "@/lib/drizzle/schemas";

export default function CreateAppPage() {
  const { isLoaded, isSignedIn } = useUser();

  const { data: domains = [], isLoading } = useQuery<TDomain[]>({
    queryKey: ["domains"],
    queryFn: async () => {
      const response = await fetch("/api/domains");
      if (!response.ok) throw new Error("Failed to fetch domains");
      return response.json();
    },
    enabled: isSignedIn,
  });

  if (isLoading || !isLoaded) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo App</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para criar um novo app
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <CreateAppForm domains={domains} />
        </div>
      </div>
    </div>
  );
}

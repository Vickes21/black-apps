"use client";

import { useQuery } from "@tanstack/react-query";
import { DomainCard } from "@/components/domain-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { TDomain } from "@/lib/drizzle/schemas";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DomainsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Domínios</h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus domínios personalizados
            </p>
          </div>
          <Button asChild>
            <Link href="/domains/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Domínio
            </Link>
          </Button>
        </div>

        {domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">
                Nenhum domínio cadastrado
              </h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Você ainda não cadastrou nenhum domínio. Comece adicionando seu primeiro
                domínio personalizado agora.
              </p>
              <Button asChild>
                <Link href="/domains/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Domínio
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

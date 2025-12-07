"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound, redirect, useParams } from "next/navigation";
import { DomainDetails } from "@/components/domain-details";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TDomain, TApp } from "@/lib/drizzle/schemas";
import { useUser } from "@clerk/nextjs";

interface DomainData {
  domain: TDomain;
  apps: TApp[];
  linkedApp: TApp | null;
}

export default function DomainPage() {
  const { isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery<DomainData>({
    queryKey: ["domain", id],
    queryFn: async () => {
      const response = await fetch(`/api/domains/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("NOT_FOUND");
        throw new Error("Failed to fetch domain");
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
      <div className="container mx-auto max-w-4xl py-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  const { domain, apps: userApps, linkedApp } = data;

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/domains">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Domínios
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalhes do Domínio</h1>
          <p className="text-muted-foreground">
            Gerencie e verifique a configuração do seu domínio
          </p>
        </div>

        <DomainDetails domain={domain} apps={userApps} linkedApp={linkedApp} />
      </div>
    </div>
  );
}

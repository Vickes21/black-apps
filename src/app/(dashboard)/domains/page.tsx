import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { DomainCard } from "@/components/domain-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function DomainsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const domains = await db.query.domains.findMany({
    where: (domains, { eq }) => eq(domains.userId, userId),
    orderBy: (domains, { desc }) => [desc(domains.createdAt)],
  });

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

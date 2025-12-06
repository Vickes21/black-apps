import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { DomainDetails } from "@/components/domain-details";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { domains, apps } from "@/lib/drizzle/schemas";
import { eq, and } from "drizzle-orm";

interface DomainPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const domain = await db.query.domains.findFirst({
    where: and(
      eq(domains.id, id),
      eq(domains.userId, userId)
    ),
  });

  if (!domain) {
    notFound();
  }

  const userApps = await db.query.apps.findMany({
    where: eq(apps.userId, userId),
    orderBy: (apps, { desc }) => [desc(apps.createdAt)],
  });

  let linkedApp = null;
  if (domain.appId) {
    linkedApp = await db.query.apps.findFirst({
      where: eq(apps.id, domain.appId),
    });
  }

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

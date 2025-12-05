import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { AppCard } from "@/components/app-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function AppsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const apps = await db.query.apps.findMany({
    where: (apps, { eq }) => eq(apps.userId, userId),
    orderBy: (apps, { desc }) => [desc(apps.createdAt)],
  });

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

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { apps } from "@/lib/drizzle/schemas";
import { eq, and } from "drizzle-orm";
import { EditAppForm } from "@/components/edit-app-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditAppPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAppPage({ params }: EditAppPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const app = await db.query.apps.findFirst({
    where: and(eq(apps.id, id), eq(apps.userId, userId)),
  });

  if (!app) {
    notFound();
  }

  const domains = await db.query.domains.findMany({
    where: (domains, { eq }) => eq(domains.userId, userId),
    orderBy: (domains, { desc }) => [desc(domains.createdAt)],
  });

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

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { DomainSettingsForm } from "@/components/domain-settings-form";

interface SettingsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getApp(id: string, userId: string) {
  const app = await db.query.apps.findFirst({
    where: (apps, { eq, and }) => and(eq(apps.id, id), eq(apps.userId, userId)),
  });
  return app;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const app = await getApp(id, userId);

  if (!app) {
    notFound();
  }

  return (
    <div className="container max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações do App</h1>
        <p className="text-muted-foreground mt-2">
          Configure o domínio customizado para {app.name}
        </p>
      </div>

      <DomainSettingsForm app={app} />
    </div>
  );
}

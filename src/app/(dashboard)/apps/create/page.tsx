import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { CreateAppForm } from '@/components/create-app-form';

export default async function CreateAppPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const domains = await db.query.domains.findMany({
    where: (domains, { eq }) => eq(domains.userId, userId),
    orderBy: (domains, { desc }) => [desc(domains.createdAt)],
  });

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

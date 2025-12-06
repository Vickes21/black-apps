import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateDomainForm } from '@/components/create-domain-form';

export default async function CreateDomainPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastrar Novo Domínio</h1>
          <p className="text-muted-foreground">
            Adicione um domínio personalizado e vincule-o a um app depois
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <CreateDomainForm />
        </div>
      </div>
    </div>
  );
}

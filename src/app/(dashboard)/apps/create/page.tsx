import { CreateAppForm } from '@/components/create-app-form';

export default function CreateAppPage() {
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
          <CreateAppForm />
        </div>
      </div>
    </div>
  );
}

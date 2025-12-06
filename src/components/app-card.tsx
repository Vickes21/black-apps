"use client";

import { ExternalLink, Pencil, Trash2, Copy } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TApp } from "@/lib/drizzle/schemas/apps";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AppCardProps {
  app: TApp;
}

export function AppCard({ app }: AppCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja deletar "${app.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar app");
      }

      toast.success("App deletado com sucesso!", {
        description: `${app.name} foi removido.`,
      });

      router.refresh();
    } catch (error) {
      toast.error("Erro ao deletar app", {
        description:
          error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit() {
    router.push(`/apps/${app.id}/edit`);
  }

  function handleView() {
    router.push(`/app/${app.id}`);
  }

  async function handleCopyUrl() {
    // Usa domínio customizado se existir, senão usa URL padrão
    const url = app.customDomain 
      ? `https://${app.customDomain}`
      : `${window.location.origin}/app/${app.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiada!", {
        description: app.customDomain 
          ? `${url} foi copiado.`
          : "O link do app foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast.error("Erro ao copiar URL", {
        description: "Não foi possível copiar o link.",
      });
    }
  }

  const appUrl = app.customDomain 
    ? `https://${app.customDomain}`
    : typeof window !== 'undefined' 
      ? `${window.location.origin}/app/${app.id}` 
      : `/app/${app.id}`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={app.imageUrl}
              alt={app.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{app.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {app.embbedUrl}
            </p>
            <p className="text-xs text-primary/70 truncate mt-1 font-mono">
              {appUrl}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleView}
          title="Visualizar"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyUrl}
          title="Copiar URL"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Deletar"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

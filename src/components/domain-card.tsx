"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { TDomain } from "@/lib/drizzle/schemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DomainCardProps {
  domain: TDomain;
}

export function DomainCard({ domain }: DomainCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    
    if (!confirm(`Tem certeza que deseja deletar "${domain.hostname}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/domains/${domain.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar domínio");
      }

      toast.success("Domínio deletado com sucesso!", {
        description: `${domain.hostname} foi removido.`,
      });

      router.refresh();
    } catch (error) {
      toast.error("Erro ao deletar domínio", {
        description:
          error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsDeleting(false);
    }
  }
  const getStatusBadge = () => {
    switch (domain.status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Ativo
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Falhou
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {domain.status}
          </Badge>
        );
    }
  };

  const getSslBadge = () => {
    if (!domain.sslStatus) return null;
    
    switch (domain.sslStatus) {
      case "active":
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-500">
            SSL Ativo
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
            SSL Pendente
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-500">
            SSL Falhou
          </Badge>
        );
    }
  };

  return (
    <Card className="transition-all hover:shadow-lg hover:border-primary/50">
      <Link href={`/domains/${domain.id}`}>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold truncate">{domain.hostname}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge()}
            {getSslBadge()}
          </div>
          {domain.verificationErrors && (
            <p className="mt-2 text-xs text-red-500 line-clamp-2">
              {domain.verificationErrors}
            </p>
          )}
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Criado em {new Date(domain.createdAt).toLocaleDateString("pt-BR")}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Deletar"
          className="text-destructive hover:text-destructive h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

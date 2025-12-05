"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TApp } from "@/lib/drizzle/schemas/apps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";

interface DomainSettingsFormProps {
  app: TApp;
}

export function DomainSettingsForm({ app }: DomainSettingsFormProps) {
  const router = useRouter();
  const [customDomain, setCustomDomain] = useState(app.customDomain || "");
  const [isLoading, setIsLoading] = useState(false);

  const defaultUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/app/${app.id}` 
    : `/app/${app.id}`;

  const customUrl = customDomain ? `https://${customDomain}` : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/apps/${app.id}/domain`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customDomain: customDomain || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar domínio");
      }

      toast.success("Domínio atualizado!", {
        description: customDomain 
          ? `Seu app agora está disponível em ${customDomain}` 
          : "Domínio customizado removido",
      });

      router.refresh();
    } catch (error) {
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiada!");
    } catch (error) {
      toast.error("Erro ao copiar URL");
    }
  }

  return (
    <div className="space-y-6">
      {/* URL Padrão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">URL Padrão</CardTitle>
          <CardDescription>
            Esta é a URL padrão do seu app, sempre disponível
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
              {defaultUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyUrl(defaultUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domínio Customizado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Domínio Customizado</CardTitle>
          <CardDescription>
            Configure seu próprio domínio para este app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customDomain">Domínio</Label>
              <Input
                id="customDomain"
                type="text"
                placeholder="meuapp.com ou app.meudominio.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
              />
              <p className="text-xs text-muted-foreground">
                Digite apenas o domínio, sem http:// ou https://
              </p>
            </div>

            {customUrl && (
              <div className="p-3 bg-muted rounded-md space-y-2">
                <p className="text-sm font-medium">URL Final:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-primary">
                    {customUrl}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyUrl(customUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Domínio"}
              </Button>
              {customDomain && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomDomain("")}
                  disabled={isLoading}
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Instruções DNS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Configuração DNS
          </CardTitle>
          <CardDescription>
            Siga estas instruções para configurar seu domínio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">1. Acesse o painel DNS do seu domínio</p>
                <p className="text-sm text-muted-foreground">
                  Cloudflare, GoDaddy, Registro.br, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">2. Adicione um registro CNAME</p>
                <div className="mt-2 p-3 bg-muted rounded-md space-y-1 font-mono text-sm">
                  <p><span className="text-muted-foreground">Tipo:</span> CNAME</p>
                  <p><span className="text-muted-foreground">Nome:</span> @ (ou seu subdomínio)</p>
                  <p><span className="text-muted-foreground">Valor:</span> worker.blackapps.online</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Você receberá o endereço do Worker após configurar o Cloudflare
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">3. Aguarde a propagação DNS</p>
                <p className="text-sm text-muted-foreground">
                  Pode levar de alguns minutos até 48 horas
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

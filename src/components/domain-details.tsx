'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, CheckCircle, Clock, XCircle, Copy, ExternalLink, Link as LinkIcon, Unlink } from 'lucide-react';
import { TDomain, TApp } from '@/lib/drizzle/schemas';
import { toast } from 'sonner';

interface DomainDetailsProps {
  domain: TDomain;
  apps: TApp[];
  linkedApp?: TApp | null;
}

export function DomainDetails({ domain, apps, linkedApp }: DomainDetailsProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>(domain.appId || '');
  const router = useRouter();

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/domains/${domain.id}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao verificar domínio');
      }

      toast.success('Verificação concluída!', {
        description: 'O status do domínio foi atualizado.',
      });

      router.refresh();
    } catch (error) {
      console.error('Erro ao verificar domínio:', error);
      toast.error('Erro ao verificar domínio', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLinkApp = async () => {
    setIsLinking(true);
    try {
      const response = await fetch(`/api/domains/${domain.id}/link`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: selectedAppId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao vincular app');
      }

      toast.success(selectedAppId ? 'App vinculado!' : 'App desvinculado!', {
        description: selectedAppId 
          ? 'O domínio foi vinculado ao app com sucesso.' 
          : 'O domínio foi desvinculado do app.',
      });

      router.refresh();
    } catch (error) {
      console.error('Erro ao vincular app:', error);
      toast.error('Erro ao vincular app', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!', {
      description: 'Texto copiado para a área de transferência.',
    });
  };

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
        return <Badge variant="secondary">{domain.status}</Badge>;
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

  const ownershipVerification = domain.ownershipVerification 
    ? JSON.parse(domain.ownershipVerification) 
    : null;

  const ownershipVerificationHttp = domain.ownershipVerificationHttp
    ? JSON.parse(domain.ownershipVerificationHttp)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{domain.hostname}</h2>
          <div className="flex gap-2">
            {getStatusBadge()}
            {getSslBadge()}
          </div>
        </div>
        <Button onClick={handleVerify} disabled={isVerifying}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Verificando...' : 'Verificar Status'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            App Vinculado
          </CardTitle>
          <CardDescription>
            {linkedApp 
              ? `Este domínio está vinculado ao app "${linkedApp.name}"`
              : 'Vincule este domínio a um app para começar a usá-lo'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkedApp && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">App:</span>
                <span className="text-sm">{linkedApp.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">URL:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">{linkedApp.embbedUrl}</code>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {linkedApp ? 'Alterar App Vinculado' : 'Selecionar App'}
            </label>
            <Select
              value={selectedAppId || undefined}
              onValueChange={setSelectedAppId}
              disabled={isLinking}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um app" />
              </SelectTrigger>
              <SelectContent>
                {apps.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
                {apps.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Nenhum app cadastrado
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleLinkApp} 
              disabled={isLinking || selectedAppId === (domain.appId || '') || !selectedAppId}
              className="flex-1"
            >
              {isLinking ? 'Salvando...' : 'Vincular App'}
            </Button>
            {linkedApp && (
              <Button 
                variant="outline"
                onClick={async () => {
                  const previousAppId = selectedAppId;
                  setSelectedAppId('');
                  try {
                    setIsLinking(true);
                    const response = await fetch(`/api/domains/${domain.id}/link`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        appId: null,
                      }),
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || 'Erro ao desvincular app');
                    }

                    toast.success('App desvinculado!', {
                      description: 'O domínio foi desvinculado do app.',
                    });

                    router.refresh();
                  } catch (error) {
                    console.error('Erro ao desvincular app:', error);
                    setSelectedAppId(previousAppId);
                    toast.error('Erro ao desvincular app', {
                      description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
                    });
                  } finally {
                    setIsLinking(false);
                  }
                }}
                disabled={isLinking}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Desvincular
              </Button>
            )}
          </div>

          {apps.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Você precisa criar um app antes de vincular
            </p>
          )}
        </CardContent>
      </Card>

      {domain.status === 'active' && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-500 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Domínio Ativo
            </CardTitle>
            <CardDescription>
              Seu domínio está configurado e funcionando corretamente!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href={`https://${domain.hostname}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visitar Domínio
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {domain.verificationErrors && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Erros de Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-500">{domain.verificationErrors}</p>
          </CardContent>
        </Card>
      )}

      {ownershipVerification && (
        <Card>
          <CardHeader>
            <CardTitle>Configuração DNS (TXT Record)</CardTitle>
            <CardDescription>
              Adicione este registro TXT no seu provedor de DNS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tipo:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">TXT</code>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Nome:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                    {ownershipVerification.name}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ownershipVerification.name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Valor:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                    {ownershipVerification.value}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ownershipVerification.value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {ownershipVerificationHttp && (
        <Card>
          <CardHeader>
            <CardTitle>Verificação HTTP Alternativa</CardTitle>
            <CardDescription>
              Ou configure a verificação via HTTP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">URL:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                    {ownershipVerificationHttp.http_url}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ownershipVerificationHttp.http_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Conteúdo:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                    {ownershipVerificationHttp.http_body}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ownershipVerificationHttp.http_body)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Domínio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Criado em:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(domain.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>
          {domain.verifiedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verificado em:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(domain.verifiedAt).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
          {domain.cloudflareId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cloudflare ID:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {domain.cloudflareId}
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

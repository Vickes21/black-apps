'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAppSchema, TCreateApp } from '@/schemas/app-schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TDomain, TApp } from '@/lib/drizzle/schemas';
import { SUPPORTED_LANGUAGES } from '@/lib/translations';

interface EditAppFormProps {
  app: TApp;
  domains: TDomain[];
}

export function EditAppForm({ app, domains }: EditAppFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TCreateApp>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: app.name,
      embbedUrl: app.embbedUrl,
      imageUrl: app.imageUrl,
      language: app.language || 'pt',
      domainId: app.domainId || null,
    },
  });

  async function onSubmit(values: TCreateApp) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar app');
      }

      toast.success('App atualizado com sucesso!', {
        description: `${values.name} foi atualizado.`,
      });
      
      router.push('/apps');
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar app:', error);
      toast.error('Erro ao atualizar app', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do app" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="embbedUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.png"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Idioma usado nos textos de instalação do app
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domainId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domínio Customizado (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um domínio (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.hostname} {domain.status === 'active' ? '✓' : `(${domain.status})`}
                    </SelectItem>
                  ))}
                  {domains.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Nenhum domínio cadastrado
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione um domínio verificado para usar como URL customizada
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/apps')}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDomainSchema, TCreateDomain } from '@/schemas/domain-schema';
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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateDomainForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TCreateDomain>({
    resolver: zodResolver(createDomainSchema),
    defaultValues: {
      hostname: '',
    },
  });

  async function onSubmit(values: TCreateDomain) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao cadastrar domínio');
      }

      const domain = await response.json();

      toast.success('Domínio cadastrado com sucesso!', {
        description: `${values.hostname} foi registrado na Cloudflare.`,
      });
      
      form.reset();
      router.push(`/domains/${domain.id}`);
      router.refresh();
    } catch (error) {
      console.error('Erro ao cadastrar domínio:', error);
      toast.error('Erro ao cadastrar domínio', {
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
          name="hostname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domínio</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="app.meudominio.com"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toLowerCase().trim())}
                />
              </FormControl>
              <FormDescription>
                Digite apenas o domínio, sem http:// ou https://
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h3 className="font-semibold text-sm">Próximos passos:</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Após cadastrar, você receberá instruções de configuração DNS</li>
            <li>Configure os registros DNS no seu provedor de domínio</li>
            <li>Aguarde a propagação DNS (pode levar até 48 horas)</li>
            <li>Use o botão de verificação para confirmar a configuração</li>
            <li>Vincule o domínio a um app na página de detalhes</li>
          </ol>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Cadastrando...' : 'Cadastrar Domínio'}
        </Button>
      </form>
    </Form>
  );
}

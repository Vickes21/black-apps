import { z } from 'zod';

export const createAppSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  embbedUrl: z.string().url('URL inválida'),
  imageUrl: z.string().url('URL da imagem inválida'),
  language: z.enum(['pt', 'en', 'es', 'fr', 'de']),
  domainId: z.string().uuid('Domínio inválido').nullable().optional(),
  customDomain: z.string()
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, 'Formato de domínio inválido')
    .optional()
    .or(z.literal('')),
});

export type TCreateApp = z.infer<typeof createAppSchema>;

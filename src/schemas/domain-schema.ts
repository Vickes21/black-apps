import { z } from 'zod';

export const createDomainSchema = z.object({
  hostname: z.string()
    .min(1, 'Domínio é obrigatório')
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, 'Formato de domínio inválido')
    .refine((val) => !val.includes('http'), 'Não inclua http:// ou https://'),
});

export const linkDomainSchema = z.object({
  appId: z.string().uuid('App inválido').nullable(),
});

export type TCreateDomain = z.infer<typeof createDomainSchema>;
export type TLinkDomain = z.infer<typeof linkDomainSchema>;

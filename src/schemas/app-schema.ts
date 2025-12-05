import { z } from 'zod';

export const createAppSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  embbedUrl: z.string().url('URL inválida'),
  imageUrl: z.string().url('URL da imagem inválida'),
});

export type TCreateApp = z.infer<typeof createAppSchema>;

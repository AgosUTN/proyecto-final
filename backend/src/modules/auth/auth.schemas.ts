import { z } from 'zod';

export const loginSchema = z
  .object({
    nombreUsuario: z.string().trim().min(1).max(50),
    // bcrypt solo considera los primeros 72 bytes
    contrasena: z.string().min(1).max(72),
  })
  .strict()
  .meta({ id: 'Login' });
export type LoginDto = z.infer<typeof loginSchema>;

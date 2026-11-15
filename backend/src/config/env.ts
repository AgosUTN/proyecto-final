import { z } from 'zod';

const SEGUNDOS_POR_UNIDAD = { s: 1, m: 60, h: 3600, d: 86400 } as const;

/** Convierte una duración con el formato `<número><s|m|h|d>` (por ejemplo, `3h`) a segundos. */
function duracionEnSegundos(valor: string): number {
  const unidad = valor.slice(-1) as keyof typeof SEGUNDOS_POR_UNIDAD;
  return Number(valor.slice(0, -1)) * SEGUNDOS_POR_UNIDAD[unidad];
}

const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  JWT_SECRET: z.string().min(32),
  /** Duración de la sesión, ya convertida a segundos. */
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^[1-9]\d*[smhd]$/)
    .transform(duracionEnSegundos),
  CORS_ORIGIN: z.url(),
});

export type Env = z.infer<typeof esquemaEnv>;

const DESCRIPCION_POR_CODIGO: Record<string, string> = {
  invalid_type: 'ausente o con un tipo incorrecto',
  too_small: 'valor demasiado corto o pequeño',
  invalid_format: 'formato inválido',
  invalid_value: 'valor no permitido',
};

function cargarEnv(): Env {
  const resultado = esquemaEnv.safeParse(process.env);
  if (resultado.success) return resultado.data;

  const detalle = resultado.error.issues
    .map((issue) => `${issue.path.join('.')} (${DESCRIPCION_POR_CODIGO[issue.code] ?? 'valor inválido'})`)
    .join(', ');
  throw new Error(`Configuración inválida. Variables de entorno con error: ${detalle}.`);
}

/** Variables de entorno validadas. Si alguna falta o es inválida, el servidor no arranca. */
export const env = cargarEnv();

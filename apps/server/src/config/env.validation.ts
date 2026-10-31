import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  CLIENT_URL: z.union([z.url(), z.literal('')]).optional(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional(),
  PROFILE: z.enum(['0', '1']).default('0'),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().optional(),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().int().positive().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }

  return { ...config, ...result.data };
}

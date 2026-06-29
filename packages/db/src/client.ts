import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export type AdapterOptions = {
  databaseUrl?: string;
  maxPoolSize?: number;
};

export const createAdapter = (databaseUrl: string | undefined) =>
  new PrismaPg({
    connectionString: databaseUrl,
  });

export const createAdapterWithPool = (options: AdapterOptions) =>
  new PrismaPg({
    connectionString: options.databaseUrl,
    max: options.maxPoolSize ?? 50,
  });

export { PrismaClient };

export * from "./generated/prisma/client.js";
export * from "./generated/prisma/client.js";
export type * from "./generated/prisma/client.js";

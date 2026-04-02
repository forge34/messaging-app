import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export const createAdapter = (databaseUrl: string | undefined) =>
  new PrismaPg({
    connectionString: databaseUrl,
  });

export { PrismaClient };

export * from "./generated/prisma/client.js";
export * from "./generated/prisma/client.js";
export type * from "./generated/prisma/client.js";

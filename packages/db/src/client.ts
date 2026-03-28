import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export const createPrismaClient = (databaseUrl: string | undefined) => {
  if (!databaseUrl) {
    throw new Error("databaseUrl not defined");
  }
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });
  return new PrismaClient({ adapter });
};

export * from "./generated/prisma/client.js";
export * from "./generated/prisma/client.js";
export type * from "./generated/prisma/client.js";

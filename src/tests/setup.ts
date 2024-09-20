import { prisma } from "../config/prisma-client";
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: "cm13m1xlm000108m8dwe25r9k" },
  process.env.SECRET,
  {
    expiresIn: "7d",
  },
);

export const tokenString = `jwt=${token}`;

beforeEach(async () => {
  const deleteConverations = prisma.conversation.deleteMany();
  const deleteUsers = prisma.user.deleteMany();
  const createUsers = prisma.user.createMany({
    data: [
      {
        id: "cm13m1xlm000108m8dwe25r9k",
        name: "forge",
        imgUrl: "fakeurl",
        password: "testpass",
      },

      {
        id: "cm13qq17b000008l80a935uq7",
        name: "forge2",
        imgUrl: "fakeurl",
        password: "testpass",
      },
    ],
  });

  const createConversation = prisma.conversation.create({
    data: {
      id: "cm1996epp000208mic322962e",
      title: "title",
      users: {
        connect: [
          { id: "cm13m1xlm000108m8dwe25r9k" },
          { id: "cm13qq17b000008l80a935uq7" },
        ],
      },
    },
  });
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`),
      createUsers,
      createConversation,
    ]);
  } catch (error) {
    console.log({ error });
  }
});

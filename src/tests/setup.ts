import { prisma } from "../config/prisma-client";
import jwt from "jsonwebtoken"

const token = jwt.sign(
  { id: "cm13m1xlm000108m8dwe25r9k" },
  process.env.SECRET,
  {
    expiresIn: "7d",
  },
);

export const tokenString = `jwt=${token}`;
beforeEach(async () => {
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

  await prisma.$transaction([deleteUsers, createUsers]);
});


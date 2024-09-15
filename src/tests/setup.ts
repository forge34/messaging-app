import { prisma } from "../config/prisma-client";



beforeAll(async () => {
  // await prisma.user.deleteMany({});

  await prisma.user.createMany({
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
});

afterAll(async () => {
  await prisma.user.deleteMany();
});

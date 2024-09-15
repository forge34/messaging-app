import { prismaClient } from "../app";



beforeAll(async () => {
  // await prismaClient.user.deleteMany({});

  await prismaClient.user.createMany({
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
  await prismaClient.user.deleteMany();
});

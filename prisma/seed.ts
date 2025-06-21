import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("🧹 Clearing existing data...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();

  console.log(`🔐 All users will use password: ${password}\n`);

  // 1. Create Mohamed
  const mohamed = await prisma.user.create({
    data: {
      name: "Mohamed Abdeltawab",
      password: hashedPassword,
      imgUrl: faker.image.avatar(),
    },
  });
  console.log(`👤 ${mohamed.name} (main user)`);

  // 2. Create 4 other users
  const otherUsers = await Promise.all(
    Array.from({ length: 4 }).map(async () => {
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const fullName = `${first} ${last}`;

      const user = await prisma.user.create({
        data: {
          name: fullName,
          password: hashedPassword,
          imgUrl: faker.image.avatar(),
        },
      });

      console.log(`👤 ${fullName}`);
      return user;
    }),
  );

  // 3. Create 1:1 conversations between Mohamed and each other user
  for (const otherUser of otherUsers) {
    const conversation = await prisma.conversation.create({
      data: {
        type: "PRIVATE",
        users: {
          connect: [{ id: mohamed.id }, { id: otherUser.id }],
        },
        conversationImg: faker.image.avatar(),
      },
    });

    // 4. Add 50 alternating messages that make sense
    const messages = Array.from({ length: 50 }).map((_, i) => {
      const senderId = i % 2 === 0 ? mohamed.id : otherUser.id;
      const body = faker.lorem.sentences({ min: 1, max: 2 });

      return {
        body,
        authorId: senderId,
        conversationId: conversation.id,
        createdAt: faker.date.recent({ days: 7 }),
      };
    });

    await prisma.message.createMany({ data: messages });
    console.log(`💬 Conversation created: Mohamed ↔ ${otherUser.name}`);
  }

  console.log("\n✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AvatarGenerator } from "random-avatar-generator";
const prisma = new PrismaClient();
const generator = new AvatarGenerator();

async function main() {
  const hashedPassword = await bcrypt.hash("password", 10);

  const forge = await prisma.user.create({
    data: {
      name: "forge",
      password: hashedPassword,
      imgUrl: generator.generateRandomAvatar(),
    },
  });

  const userNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan"];
  const users = await Promise.all(
    userNames.map((name) =>
      prisma.user.create({
        data: {
          name,
          password: hashedPassword,
          imgUrl: generator.generateRandomAvatar(),
        },
      }),
    ),
  );

  const baseTime = new Date();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const messages = [
      {
        body: `Hi ${user.name}, how are you doing?`,
        authorId: forge.id,
      },
      {
        body: `Hey forge! I'm doing well. Just been working on some projects.`,
        authorId: user.id,
      },
      {
        body: `That's great to hear. What kind of projects?`,
        authorId: forge.id,
      },
      {
        body: `Mostly web development stuff. Trying out some new libraries.`,
        authorId: user.id,
      },
      {
        body: `Nice. I'm working on a messaging app right now. Learning a lot.`,
        authorId: forge.id,
      },
      {
        body: `That sounds fun. Are you using React?`,
        authorId: user.id,
      },
      {
        body: `Yeah, React + Zustand + Prisma. It’s been smooth so far.`,
        authorId: forge.id,
      },
    ];

    const conversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: forge.id }, { id: user.id }],
        },
        type: "PRIVATE",
      },
    });

    // Create messages with timestamps
    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      await prisma.message.create({
        data: {
          body: msg.body,
          authorId: msg.authorId,
          conversationId: conversation.id,
          createdAt: new Date(baseTime.getTime() + i * 10_000 + j * 60_000),
          status: j < 5 ? "DELIVERED" : "READ",
        },
      });
    }

    console.log(`Seeded conversation with ${user.name}`);
  }
}

main()
  .then(async () => {
    console.log("Seeding complete.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from "@chat/db"

const resetDB = async () => {
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.user.deleteMany()
  ])
}

beforeEach(async () => {
  await resetDB()
})

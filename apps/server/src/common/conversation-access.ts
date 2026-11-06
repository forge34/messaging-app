import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export async function assertConversationMember(
  prisma: PrismaService,
  userId: string,
  conversationId: string,
): Promise<void> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      users: { some: { id: userId } },
    },
    select: { id: true },
  });

  if (!conversation) {
    throw new NotFoundException('Conversation not found');
  }
}

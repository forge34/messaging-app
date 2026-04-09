import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseZodSchema } from 'zod-key-parser';
import { baseConversationSchema, baseMessageSchema } from '@chat/shared';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async delete(id: string) {
    await this.prisma.conversation.delete({
      where: {
        id,
      },
    });
  }

  async getConversationById(id: string, userId: string) {
    const conversationSelect = parseZodSchema(
      baseConversationSchema,
    ).selectKeys;

    const messagesSelect = parseZodSchema(baseMessageSchema).selectKeys;

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
      },
      select: { ...conversationSelect, messages: { select: messagesSelect } },
    });

    if (!conversation)
      throw new NotFoundException(`Invalid conversation id: ${id}`);

    const otherUser = conversation.users.find((user) => user.id !== userId);

    if (!otherUser)
      throw new UnprocessableEntityException(
        'Conversation must have at least 2 participants',
      );

    console.log(conversation.messages);

    const mappedMessages = conversation.messages
      .map(({ authorId, bookmarkedBy, ...rest }) => {
        return {
          ...rest,
          authorId,
          bookmarkedBy,
          isMine: authorId === userId,
          isBookmarked:
            bookmarkedBy.findIndex(({ id }) => id === userId) >= 0
              ? true
              : false,
        };
      })
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    const mapped = {
      ...conversation,
      messages: mappedMessages,
      title: otherUser.name ?? 'Conversation',
      lastSeen: otherUser.lastSeen ?? undefined,
    };

    return mapped;
  }

  async getCurrentUserConversation(userId: string) {
    const conversationListSelect = parseZodSchema(
      baseConversationSchema,
    ).selectKeys;

    const messagesSelect = parseZodSchema(baseMessageSchema).selectKeys;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        users: { some: { id: userId } },
      },
      select: {
        ...conversationListSelect,
        messages: { select: messagesSelect },
      },
    });

    if (conversations.length == 0) return [];

    const filteredConversations = conversations.map(
      ({ users, messages, ...rest }) => {
        const otherUser = users.find((user) => user.id !== userId);

        const last = messages.length > 0 ? messages[messages.length - 1] : null;

        const lastMessage = last
          ? {
              id: last.id,
              body: last.body,
              author: last.author,
              status: last.status,
              createdAt: last.createdAt,
            }
          : null;

        return {
          ...rest,
          users,
          otherUser,
          lastMessage,
          lastMessageAt: lastMessage?.createdAt ?? null,
          title: otherUser?.name ?? 'Conversation',
        };
      },
    );

    return filteredConversations;
  }
}

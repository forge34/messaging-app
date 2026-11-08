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

  async delete(id: string, userId: string) {
    const result = await this.prisma.conversation.deleteMany({
      where: {
        id,
        users: { some: { id: userId } },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Invalid conversation id: ${id}`);
    }
  }

  async getConversationById(id: string, userId: string) {
    const conversationSelect = parseZodSchema(
      baseConversationSchema,
    ).selectKeys;

    const messagesSelect = {
      ...parseZodSchema(baseMessageSchema).selectKeys,
      bookmarkedBy: { select: { id: true } },
    };

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        users: { some: { id: userId } },
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

    const mappedMessages = conversation.messages
      .map(({ authorId, bookmarkedBy, ...rest }) => ({
        ...rest,
        authorId,
        isMine: authorId === userId,
        isBookmarked: bookmarkedBy.some(({ id }) => id === userId),
      }))
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

    const { author, createdAt, body, status, id, attachment } =
      parseZodSchema(baseMessageSchema).selectKeys;
    const messagesSelect = { author, createdAt, body, status, id, attachment };

    const conversations = await this.prisma.conversation.findMany({
      where: {
        users: { some: { id: userId } },
      },
      select: {
        ...conversationListSelect,
        messages: {
          select: messagesSelect,

          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
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
              attachment: last.attachment,
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

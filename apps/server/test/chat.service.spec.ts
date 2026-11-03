import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ChatService } from '../src/chat/chat.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { PrismaService } from '../src/prisma/prisma.service';
import type { PublicMessageSchema } from '@chat/shared';
import type { AttachmentType, User } from '@chat/db/client';

const envFile = readFileSync(resolve(__dirname, '../../../.env'), 'utf8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (match && !(match[1] in process.env)) {
    process.env[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
  }
}

describe('ChatService attachment messages (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let chatService: ChatService;

  let author: User;
  let recipient: User;
  let conversationId: string;

  const socket = {
    emit: jest.fn(),
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    broadcast: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) },
    join: jest.fn(),
  } as never;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [ChatService, NotificationsService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    chatService = app.get(ChatService);

    const [authorUser, recipientUser, conversation] = await prisma.$transaction(
      [
        prisma.user.create({
          data: {
            name: `e2e-chat-author-${Date.now()}`,
            password: 'test-password',
            imgUrl: 'https://example.com/a.png',
          },
        }),
        prisma.user.create({
          data: {
            name: `e2e-chat-recipient-${Date.now()}`,
            password: 'test-password',
            imgUrl: 'https://example.com/b.png',
          },
        }),
        prisma.conversation.create({ data: {} }),
      ],
    );

    author = authorUser;
    recipient = recipientUser;
    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { users: { connect: [{ id: author.id }, { id: recipient.id }] } },
    });
    conversationId = updated.id;
  });

  afterAll(async () => {
    const userIds = [author?.id, recipient?.id].filter((id): id is string =>
      Boolean(id),
    );
    if (userIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await app.close();
  });

  function buildMessage(
    body: string,
    attachment?: {
      type: AttachmentType;
      url: string;
      publicId: string;
      format: string;
      width?: number | null;
      height?: number | null;
      bytes?: number | null;
    },
  ): PublicMessageSchema {
    return { body, attachment: attachment ?? null } as PublicMessageSchema;
  }

  async function countConversationMessages() {
    return prisma.message.count({ where: { conversationId } });
  }

  it('ignores messages with neither body nor attachment', async () => {
    const countBefore = await countConversationMessages();

    await chatService.handleMessageCreate(
      socket,
      author,
      buildMessage('  '),
      conversationId,
      'temp-ignored',
      null,
    );

    expect(await countConversationMessages()).toBe(countBefore);
  });

  it('creates a text message without an attachment row', async () => {
    const countBefore = await countConversationMessages();

    await chatService.handleMessageCreate(
      socket,
      author,
      buildMessage('hello there'),
      conversationId,
      'temp-text',
      null,
    );

    const message = await prisma.message.findFirst({
      where: { conversationId, body: 'hello there' },
      include: { attachment: true },
    });

    expect(message).toBeTruthy();
    expect(message?.attachment).toBeNull();
    expect(await countConversationMessages()).toBe(countBefore + 1);
  });

  it('creates an attachment-only sticker message with empty body', async () => {
    const publicId = `chat/stickers/e2e-${Date.now()}`;
    const attachment = {
      type: 'STICKER' as AttachmentType,
      url: 'https://res.example/sticker.png',
      publicId,
      format: 'png',
      width: 512,
      height: 512,
      bytes: 2048,
    };

    await chatService.handleMessageCreate(
      socket,
      recipient,
      buildMessage('', attachment),
      conversationId,
      'temp-sticker',
      null,
    );

    const stickerMessage = await prisma.messageAttachment.findUnique({
      where: { publicId },
      include: { message: true },
    });

    expect(stickerMessage?.message.body).toBe('');
    expect(stickerMessage?.type).toBe('STICKER');
    expect(stickerMessage?.message.conversationId).toBe(conversationId);

    const notification = await prisma.notification.findFirst({
      where: {
        userId: author?.id,
        data: { path: ['messageId'], equals: stickerMessage?.messageId },
      },
    });

    expect(notification).toBeTruthy();
    expect(notification?.body).toBeNull();

    await prisma.notification.delete({
      where: { id: notification!.id },
    });
  });
});

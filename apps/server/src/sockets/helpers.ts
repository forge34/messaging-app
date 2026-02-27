import { prisma } from "@chat/db/client";
import { EventMap, EventObject } from "@chat/shared";
import { logger } from "../lib/logger.js";
import z from "zod";

export function createSafeListener<
  TGroup extends EventObject,
  TKey extends keyof TGroup & string,
>(eventGroup: TGroup, eventKey: TKey, handler: EventMap<TGroup>[TKey]) {
  const eventDef = eventGroup[eventKey];

  return (...args: unknown[]) => {
    const result = eventDef.input.safeParse(args);

    if (!result.success) {
      logger.error(
        {
          event: eventDef.name,
          payload: args,
          validationErrors: z.treeifyError(result.error),
        },
        `[Validation Failed] ${eventDef.name}`,
      );
      return;
    }

    try {
      const execution = (
        handler as (
          ...a: z.infer<TGroup[TKey]["input"]>
        ) => void | Promise<void>
      )(...(result.data as z.infer<TGroup[TKey]["input"]>));

      if (execution instanceof Promise) {
        execution.catch((err) => {
          logger.error(
            { err, event: eventDef.name },
            "Async Handler Exception",
          );
        });
      }
    } catch (err) {
      logger.error({ err, event: eventDef.name }, "Sync Handler Exception");
    }
  };
}
export async function markMessagesAsRead(
  conversationId: string,
  userId: string,
) {
  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId: conversationId,
      authorId: { not: userId },
      status: { not: "READ" },
    },
    select: { id: true },
  });

  if (!unreadMessages.length) return [];

  const messageIds = unreadMessages.map((m) => m.id);

  await prisma.message.updateMany({
    where: {
      id: {
        in: messageIds,
      },
    },
    data: {
      status: "READ",
    },
  });

  await prisma.messageReceipt.createMany({
    data: messageIds.map((id) => ({
      messageId: id,
      userId: userId,
    })),
    skipDuplicates: true,
  });

  return messageIds || [];
}

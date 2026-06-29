import { queryClient } from "@/main";
import {
  Routes,
  type ResponseSchema,
  type ServerToClientEvents,
} from "@chat/shared";
import type z from "zod";

export async function onConversatonCreate(
  ...args: Parameters<ServerToClientEvents["conversation:create"]>
) {
  const [conversation] = args;
  const conversationId = conversation.id;

  queryClient.setQueryData(
    ["conversations", conversationId],
    (
      oldData: ResponseSchema<typeof Routes.getConversationById> | undefined,
    ) => {
      if (oldData?.data) return oldData;

      return {
        ...oldData,
        data: conversation,
      };
    },
  );

  const user = queryClient.getQueryData(["user"]) as ResponseSchema<
    typeof Routes.getCurrentUser
  >;

  if (!user || !user.data) return;

  queryClient.setQueryData(
    ["conversations"],
    (
      oldData: z.infer<
        typeof Routes.getCurrentUserConversations.responseSchema
      >,
    ) => {
      if (!oldData?.data) return oldData;

      const otherConversations = oldData.data.filter(
        (c) => c.id !== conversationId,
      );
      return {
        ...oldData,
        data: [
          {
            ...conversation,
            otherUser: conversation.users.find((u) => u.id !== user.data?.id),
          },
          ...otherConversations,
        ],
      };
    },
  );
}
export async function onMesssageReaction(
  ...args: Parameters<ServerToClientEvents["message:reaction"]>
) {
  const [conversationId, message] = args;
  queryClient.setQueryData(
    ["conversations", conversationId],
    (
      oldData: ResponseSchema<typeof Routes.getConversationById> | undefined,
    ) => {
      if (!oldData?.data) return oldData;

      return {
        ...oldData,
        data: {
          ...oldData.data,
          messages: oldData.data.messages.map((m) => {
            if (m.id !== message.id) return m;

            return {
              ...m,
              messageReactions: message.messageReactions,
            };
          }),
        },
      };
    },
  );
}
export async function onMessageCreate(
  ...args: Parameters<ServerToClientEvents["message:create"]>
) {
  const [conversationId, message] = args;
  const user = queryClient.getQueryData(["user"]) as ResponseSchema<
    typeof Routes.getCurrentUser
  >;
  const isMine = message.authorId === user.data?.id;

  queryClient.setQueryData(
    ["conversations"],
    (
      oldData: z.infer<
        typeof Routes.getCurrentUserConversations.responseSchema
      >,
    ) => {
      if (!oldData?.data) return oldData;

      const otherConversations = oldData.data.filter(
        (c) => c.id !== conversationId,
      );
      const targetConversation = oldData.data.find(
        (c) => c.id === conversationId,
      );

      if (!targetConversation) return oldData;

      const updatedConversation = {
        ...targetConversation,
        lastMessage: message,
        lastMessageAt: message.createdAt,
      };

      return {
        ...oldData,
        data: [updatedConversation, ...otherConversations],
      };
    },
  );

  if (!isMine) {
    if (!message.author) return;
    queryClient.setQueryData(
      ["conversations", conversationId],
      (oldData: z.infer<typeof Routes.getConversationById.responseSchema>) => {
        if (!oldData?.data) return oldData;

        if (oldData.data.messages.some((m) => m.id === message.id))
          return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...oldData.data.messages, { ...message, isMine: false }],
          },
        };
      },
    );
  }
}
export async function onMessageRead(
  ...args: Parameters<ServerToClientEvents["message:read"]>
) {
  const [conversationId, messageIds] = args;
  queryClient.setQueryData(
    ["conversations", conversationId],
    (oldData: ResponseSchema<typeof Routes.getConversationById>) => {
      const conversation = oldData.data;

      if (!conversation) return;
      const messages = conversation.messages.map((m) => {
        if (messageIds.includes(m.id)) return { ...m, status: "READ" };
        return m;
      });

      const newConversation = { ...conversation, messages };

      return {
        ...oldData,
        data: newConversation,
      };
    },
  );
}
export async function onMessageConfirm(
  ...args: Parameters<ServerToClientEvents["message:create:confirm"]>
) {
  const [conversationId, message, tempId] = args;

  await queryClient.setQueryData(
    ["conversations", conversationId],
    (oldData: z.infer<typeof Routes.getConversationById.responseSchema>) => {
      if (!oldData?.data) return oldData;

      const updatedMessages = oldData.data.messages.map((m) => {
        if (m.clientId === tempId) {
          return {
            ...message,
            clientId: tempId,
            isMine: true,
          };
        }
        return m;
      });

      return {
        ...oldData,
        data: { ...oldData.data, messages: updatedMessages },
      };
    },
  );
}

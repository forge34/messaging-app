import type z from "zod";
import { Routes } from "@chat/shared";
import { queryClient } from "./query-client";

type DetailResponse = z.infer<
  typeof Routes.getConversationById.responseSchema
>;
type ListResponse = z.infer<
  typeof Routes.getCurrentUserConversations.responseSchema
>;
type UnreadCountResponse = { data?: { count: number } };
type NotificationsResponse = {
  pages: { data: { notifications: unknown[] } }[];
};

export type ConversationDetail = NonNullable<DetailResponse["data"]>;
export type ConversationListItem =
  NonNullable<ListResponse["data"]>[number];
export type Message = ConversationDetail["messages"][number];

const detailKey = (conversationId: string) => ["conversations", conversationId];

export function updateConversationDetail(
  conversationId: string,
  updater: (conversation: ConversationDetail) => ConversationDetail,
  qc = queryClient,
) {
  qc.setQueryData<DetailResponse>(detailKey(conversationId), (old) =>
    old?.data ? { ...old, data: updater(old.data) } : old,
  );
}

export function moveConversationToFront(
  conversationId: string,
  lastMessage: Message,
  lastMessageAt?: Date,
  qc = queryClient,
) {
  qc.setQueryData<ListResponse>(["conversations"], (old) => {
    if (!old?.data) return old;

    const target = old.data.find((c) => c.id === conversationId);
    if (!target) return old;

    const updated = {
      ...target,
      lastMessage,
      ...(lastMessageAt !== undefined ? { lastMessageAt } : {}),
    };
    return {
      ...old,
      data: [updated, ...old.data.filter((c) => c.id !== conversationId)],
    };
  });
}

export function prependNewConversation(
  conversation: ConversationDetail,
  currentUserId: string | undefined,
  qc = queryClient,
) {
  qc.setQueryData<ListResponse>(["conversations"], (old) => {
    if (!old?.data) return old;
    if (old.data.some((c) => c.id === conversation.id)) return old;

    const otherUser = conversation.users.find((u) => u.id !== currentUserId);
    const listItem = { ...conversation, otherUser } as unknown as ConversationListItem;
    return { ...old, data: [listItem, ...old.data] };
  });
}

export function appendMessage(
  conversationId: string,
  message: Message,
  { dedupe = false }: { dedupe?: boolean } = {},
  qc = queryClient,
) {
  qc.setQueryData<DetailResponse>(detailKey(conversationId), (old) => {
    if (!old?.data) return old;
    if (dedupe && old.data.messages.some((m) => m.id === message.id)) {
      return old;
    }

    return {
      ...old,
      data: { ...old.data, messages: [...old.data.messages, message] },
    };
  });
}

export function replaceTempMessage(
  conversationId: string,
  tempId: string,
  message: Message,
  qc = queryClient,
) {
  qc.setQueryData<DetailResponse>(detailKey(conversationId), (old) => {
    if (!old?.data) return old;

    const messages = old.data.messages.map((m) =>
      m.clientId === tempId ? { ...message, clientId: tempId, isMine: true } : m,
    );
    return { ...old, data: { ...old.data, messages } };
  });
}

export function markMessagesRead(
  conversationId: string,
  messageIds: string[],
  qc = queryClient,
) {
  updateConversationDetail(
    conversationId,
    (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((m) =>
        messageIds.includes(m.id) ? { ...m, status: "READ" } : m,
      ),
    }),
    qc,
  );
}

export function removeMessage(
  conversationId: string,
  messageId: string,
  qc = queryClient,
) {
  updateConversationDetail(
    conversationId,
    (conversation) => ({
      ...conversation,
      messages: conversation.messages.filter((m) => m.id !== messageId),
    }),
    qc,
  );
}

export function setMessageBookmark(
  conversationId: string,
  messageId: string,
  bookmarked: boolean,
  qc = queryClient,
) {
  updateConversationDetail(
    conversationId,
    (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((m) =>
        m.id === messageId ? { ...m, isBookmarked: bookmarked } : m,
      ),
    }),
    qc,
  );
}

export function updateMessageReactions(
  conversationId: string,
  message: Message,
  qc = queryClient,
) {
  updateConversationDetail(
    conversationId,
    (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((m) =>
        m.id === message.id
          ? { ...m, messageReactions: message.messageReactions }
          : m,
      ),
    }),
    qc,
  );
}

export function incrementUnreadCount(qc = queryClient) {
  qc.setQueryData<UnreadCountResponse>(["notifications", "unread-count"], (
    old,
  ) => ({ ...old, data: { count: (old?.data?.count ?? 0) + 1 } }));
}

export function setUnreadCount(count: number, qc = queryClient) {
  qc.setQueryData<UnreadCountResponse>(["notifications", "unread-count"], (
    old,
  ) => ({ ...old, data: { count } }));
}

export function prependNotification(
  notification: { [key: string]: unknown },
  qc = queryClient,
) {
  qc.setQueryData<NotificationsResponse>(["notifications"], (old) => {
    if (!old) return old;
    const [first, ...rest] = old.pages;
    return {
      ...old,
      pages: [
        {
          ...first,
          data: {
            ...first.data,
            notifications: [notification, ...first.data.notifications],
          },
        },
        ...rest,
      ],
    };
  });
}

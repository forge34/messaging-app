import { queryClient } from "@/lib/query-client";
import {
  appendMessage,
  markMessagesRead,
  moveConversationToFront,
  prependNewConversation,
  removeMessage,
  replaceTempMessage,
  setMessageBookmark,
  updateMessageReactions,
  type ConversationDetail,
  type Message,
} from "@/lib/cache";
import {
  Routes,
  type ResponseSchema,
  type ServerToClientEvents,
} from "@chat/shared";

export async function onConversatonCreate(
  ...args: Parameters<ServerToClientEvents["conversation:create"]>
) {
  const [conversation] = args;
  const conversationId = conversation.id;

  queryClient.setQueryData(
    ["conversations", conversationId],
    (oldData: ResponseSchema<typeof Routes.getConversationById> | undefined) => {
      if (oldData?.data) return oldData;

      return { ...oldData, data: conversation };
    },
  );

  const user = queryClient.getQueryData(["user"]) as ResponseSchema<
    typeof Routes.getCurrentUser
  > | undefined;

  if (!user?.data) return;

  prependNewConversation(
    conversation as unknown as ConversationDetail,
    user.data.id,
  );
}

export async function onMesssageReaction(
  ...args: Parameters<ServerToClientEvents["message:reaction"]>
) {
  const [conversationId, message] = args;
  updateMessageReactions(conversationId, message as unknown as Message);
}

export async function onMessageCreate(
  ...args: Parameters<ServerToClientEvents["message:create"]>
) {
  const [conversationId, message] = args;
  const user = queryClient.getQueryData(["user"]) as ResponseSchema<
    typeof Routes.getCurrentUser
  > | undefined;
  const isMine = message.authorId === user?.data?.id;

  moveConversationToFront(
    conversationId,
    message as unknown as Message,
    message.createdAt,
  );

  if (!isMine) {
    if (!message.author) return;
    appendMessage(
      conversationId,
      { ...message, isMine: false } as unknown as Message,
      { dedupe: true },
    );
  }
}

export async function onMessageRead(
  ...args: Parameters<ServerToClientEvents["message:read"]>
) {
  const [conversationId, messageIds] = args;
  markMessagesRead(conversationId, messageIds);
}

export async function onMessageDelete(
  ...args: Parameters<ServerToClientEvents["message:delete"]>
) {
  const [conversationId, messageId] = args;
  removeMessage(conversationId, messageId);
}

export async function onMessageBookmark(
  ...args: Parameters<ServerToClientEvents["message:bookmark"]>
) {
  const [conversationId, messageId, bookmarked] = args;
  setMessageBookmark(conversationId, messageId, bookmarked);
  queryClient.invalidateQueries({ queryKey: ["user", "me", "profile"] });
}

export async function onMessageConfirm(
  ...args: Parameters<ServerToClientEvents["message:create:confirm"]>
) {
  const [conversationId, message, tempId] = args;
  replaceTempMessage(conversationId, tempId, message as unknown as Message);
}

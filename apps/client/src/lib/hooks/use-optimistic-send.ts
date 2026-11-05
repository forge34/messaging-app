import type { PublicMessageSchema } from "@chat/shared";
import { appendMessage, moveConversationToFront, type Message } from "@/lib/cache";
import { socket } from "@/lib/sockets";
import type { AttachmentMeta } from "@/lib/mutations/uploads";

interface UseOptimisticSendProps {
  conversationId: string;
  author?: PublicMessageSchema["author"];
  value: string;
  resetValue: () => void;
  parentMessage?: PublicMessageSchema;
  onClearParent?: () => void;
}

export function useOptimisticSend({
  conversationId,
  author,
  value,
  resetValue,
  parentMessage,
  onClearParent,
}: UseOptimisticSendProps) {
  function send(attachmentMeta?: AttachmentMeta) {
    const content = value.trim();
    if ((!content && !attachmentMeta) || !author) return;

    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date();

    const message: Partial<PublicMessageSchema> = {
      body: content,
      clientId: tempId,
      status: "PENDING",
      author,
      createdAt,
      isMine: true,
      ...(attachmentMeta && {
        attachment: { ...attachmentMeta, id: "" },
      }),
      ...(parentMessage && { parentMessageId: parentMessage.id }),
    };

    const optimistic = message as unknown as Message;
    appendMessage(conversationId, optimistic);
    moveConversationToFront(conversationId, optimistic, createdAt);

    const parentMessageId = parentMessage ? parentMessage.id : undefined;
    socket.emit(
      "message:create",
      message,
      conversationId,
      tempId,
      parentMessageId,
    );
    resetValue();
    onClearParent?.();
  }

  return { send };
}

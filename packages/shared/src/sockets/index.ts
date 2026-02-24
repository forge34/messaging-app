import { PublicMessageSchema } from "../schemas/publicSchemas";

export interface ServerToClientEvents {
  "message:create": (
    message: PublicMessageSchema,
    conversationId: string,
    tempId: string,
  ) => void;
  "message:delete": (
    messageId: string,
    conversationId: string,
  ) => Promise<void>;
  "users:join": (onlineUsers: { userId: string; socketId: string }[]) => void;

  "message:read": (conversationId: string, messageIds: string[]) => void;
  "message:create:confirm": (
    conversationId: string,
    message: PublicMessageSchema,
    tempId: string,
  ) => void;
  typing: (username: string) => void;
}

export interface ClientToServerEvents {
  "message:create": (
    message: Partial<PublicMessageSchema>,
    conversationId: string,
    tempId: string,
  ) => void;
  "message:delete": (messageId: string, conversationId: string) => void;
  "message:read": (conversationId: string) => void;
  typing: (conversationId: string, username: string) => void;
}

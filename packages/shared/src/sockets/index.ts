import { PublicMessageSchema } from "../schemas/publicSchemas";

export type OnlineUsers = Map<
  string,
  { isOnline: boolean; timerId: NodeJS.Timeout | null }
>;

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

  "message:read": (conversationId: string, messageIds: string[]) => void;
  "message:create:confirm": (
    conversationId: string,
    message: PublicMessageSchema,
    tempId: string,
  ) => void;
  typing: (username: string) => void;
  "typing:stop": () => void;
  "message:reaction": (
    conversationId: string,
    message: PublicMessageSchema,
  ) => void;
  "users:presence_update": (onlineIds: string[]) => void;
}

export interface ClientToServerEvents {
  "message:create": (
    message: Partial<PublicMessageSchema>,
    conversationId: string,
    tempId: string,
    parentMessageId: string,
  ) => void;
  "message:delete": (messageId: string, conversationId: string) => void;
  "message:read": (conversationId: string) => void;
  typing: (conversationId: string, username: string) => void;
  "typing:stop": (conversationId: string) => void;
  "message:reaction": (
    conversationId: string,
    messageId: string,
    emoji: string,
  ) => void;
}

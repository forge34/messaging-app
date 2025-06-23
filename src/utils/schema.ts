export interface UserSchema {
  pk: number;
  id: string;
  name: string;
  messages: MessageSchema[];
  conversations: ConversationSchema[];
  isCurrent: boolean;
  conversationId: string;
  imgUrl: string;
}

export interface MessageSchema {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  conversationId: string;
  author: UserSchema;
  Conversation: ConversationSchema;
}

export interface ConversationSchema {
  id: string;
  title: string;
  messages: MessageSchema[];
  users: UserSchema[];
  type: ConversationType;
  conversationImg: string | null;
}

export enum ConversationType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP",
}

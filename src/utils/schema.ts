export interface User {
  pk: number;
  id: string;
  name: string;
  password: string;
  messages: Message[];
  conversations: Conversation[];
  privateConversation: Conversation | null;
  relatedToCurrent: boolean;
  imgUrl: string;
}

export interface Message {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  conversationId: string;
  author: User;
  Conversation: Conversation;
  ownMessage: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  users: User[];
  type: ConversationType;
}

export enum ConversationType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP",
}

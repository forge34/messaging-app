export interface User {
  pk: number;
  id: string;
  name: string;
  password: string;
  messages: Message[];
  conversations: Conversation[];

  relatedToCurrent: boolean;
}

export interface Message {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  conversationId: string;
  author: User;
  Conversation: Conversation;
  ownMessage:boolean
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  users?: User[];
}

import { z, ZodType } from "zod";
import { LoginRequest, SignupRequest } from "./schemas/auth-schema.js";
import {
  createConversationSchema,
  deleteConversationSchema,
  getConversationByIdSchema,
} from "./schemas/conversation-schema.js";

interface ApiResponseSchema<T = any> {
  message: string;
  data?: T | null;
}

export interface ApiRoute {
  url: string;
  request: ZodType;
  response: ApiResponseSchema;
}

const RequestSchemaPlaceholder = z.object({});

const ApiRoutes = {
  signup: {
    url: "/signup",
    request: SignupRequest,
    response: { message: "Account created successfully" },
  },
  login: {
    url: "/login",
    request: LoginRequest,
    response: { message: "Login successful" },
  },
  logout: {
    url: "/logout",
    request: RequestSchemaPlaceholder,
    response: { message: "Logout successful" },
  },
  createConversation: {
    url: "/conversation",
    request: createConversationSchema,
    response: { message: "Conversation created successfully" },
  },
  deleteConversation: {
    url: "/conversation/:conversationid",
    request: deleteConversationSchema,
    response: { message: "Conversation deleted successfully" },
  },
  getCurrentUserConversations: {
    url: "/conversation/currentUser",
    request: z.object({}),
    response: { message: "Fetched current user conversations" },
  },
  getConversationById: {
    url: "/conversation/:conversationid",
    request: getConversationByIdSchema,
    response: { message: "Fetched conversation by ID" },
  },
  bookmarkMessage: {
    url: "/message/:messageid/bookmark",
    request: RequestSchemaPlaceholder,
    response: { message: "Message bookmarked successfully" },
  },
  getUsers: {
    url: "/users",
    request: RequestSchemaPlaceholder,
    response: { message: "Fetched users successfully" },
  },
  getUserBookmarks: {
    url: "/users/bookmarks",
    request: RequestSchemaPlaceholder,
    response: { message: "Fetched user bookmarks successfully" },
  },
  getCurrentUser: {
    url: "/users/me",
    request: RequestSchemaPlaceholder,
    response: { message: "Fetched current user info" },
  },
  blockUser: {
    url: "/users/:userid/block",
    request: RequestSchemaPlaceholder,
    response: { message: "User blocked successfully" },
  },
} as const;

export default ApiRoutes;

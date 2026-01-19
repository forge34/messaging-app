import { z, ZodType, ZodTypeAny } from "zod";
import { LoginRequest, SignupRequest } from "./schemas/auth-schema.js";
import {
  createConversationSchema,
  deleteConversationSchema,
  getConversationByIdSchema,
} from "./schemas/conversation-schema.js";

const createResponseSchema = <T extends ZodTypeAny>(dataSchema: T) => {
  return z.object({
    message: z.string().min(1),
    data: dataSchema.nullable().optional(),
  });
};

export interface ApiRoute {
  url: string;
  request: ZodType<any>;
  response: ReturnType<typeof createResponseSchema>;
}
const RequestSchemaPlaceholder = z.object({});

const ApiRoutes = {
  signup: {
    url: "/signup",
    request: SignupRequest,
    response: createResponseSchema(z.null()),
  },
  login: {
    url: "/login",
    request: LoginRequest,
    response: createResponseSchema(z.null()),
  },
  logout: {
    url: "/logout",
    request: RequestSchemaPlaceholder,
    response: createResponseSchema(z.null()),
  },
  createConversation: {
    url: "/conversation",
    request: createConversationSchema,
    response: createResponseSchema(z.null()),
  },
  deleteConversation: {
    url: "/conversation/:conversationid",
    request: deleteConversationSchema,
    response: createResponseSchema(z.null()),
  },
  getCurrentUserConversations: {
    url: "/conversation/currentUser",
    request: z.object({}),
    response: createResponseSchema(z.null()),
  },
  getConversationById: {
    url: "/conversation/:conversationid",
    request: getConversationByIdSchema,
    response: createResponseSchema(z.null()),
  },
  bookmarkMessage: {
    url: "/message/:messageid/bookmark",
    request: RequestSchemaPlaceholder,
    response: createResponseSchema(z.null()),
  },
  getUsers: {
    url: "/users",
    request: RequestSchemaPlaceholder,
    response: createResponseSchema(z.null()),
  },
  getUserBookmarks: {
    url: "/users/bookmarks",
    request: RequestSchemaPlaceholder,
    response: createResponseSchema(z.null()),
  },
  getCurrentUser: {
    url: "/users/me",
    request: RequestSchemaPlaceholder,
    response: createResponseSchema(z.null()),
  },
  blockUser: {
    url: "/users/:userid/block",
    request: RequestSchemaPlaceholder,
    response: createResponseSchema(z.null()),
  },
} as const satisfies Record<string, ApiRoute>;

export default ApiRoutes;

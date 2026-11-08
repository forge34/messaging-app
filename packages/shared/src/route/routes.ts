import z from "zod";
import { createRoute } from "./routeConfig.js";
import { LoginRequest, SignupRequest } from "../schemas/auth-schema.js";
import {
  PublicConversationSchema,
  ConversationListSchema,
} from "../schemas/conversation-schema.js";
import { FullUserSchema } from "../schemas/full-user-schema.js";
import { PublicMessageSchema } from "../schemas/message-schema.js";
import { PublicUserSchema } from "../schemas/user-schema.js";
import { PublicNotificationSchema } from "../schemas/notification-schema.js";
import {
  PublicStickerSchema,
  UploadSignatureRequest,
  UploadSignatureResponse,
} from "../schemas/upload-schema.js";

const EmptyParamQueries = {
  params: z.object({}),
  queries: z.object({}),
};
export const Routes = {
  login: createRoute({
    ...EmptyParamQueries,
    path: "/login",
    method: "POST",
    requestBody: LoginRequest,
    responseData: PublicUserSchema,
  }),
  signup: createRoute({
    ...EmptyParamQueries,
    path: "/signup",
    method: "POST",
    requestBody: SignupRequest,
    responseData: z.undefined(),
  }),

  logout: createRoute({
    ...EmptyParamQueries,
    path: "/logout",
    method: "POST",
    requestBody: z.object({}).strict(),
    responseData: z.undefined(),
  }),
  deleteConversation: createRoute({
    ...EmptyParamQueries,
    path: "/conversation/:id",
    method: "DELETE",
    requestBody: z.undefined(),
    params: z.object({ id: z.string().nonempty() }),
    responseData: z.undefined(),
  }),
  getCurrentUserConversations: createRoute({
    ...EmptyParamQueries,
    path: "/conversation/currentUser",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.array(ConversationListSchema),
  }),
  getConversationById: createRoute({
    ...EmptyParamQueries,
    path: "/conversation/:id",
    method: "GET",
    params: z.object({
      id: z.string().nonempty(),
    }),
    requestBody: z.undefined(),
    responseData: PublicConversationSchema,
  }),
  getCurrentUser: createRoute({
    ...EmptyParamQueries,
    path: "/users/me",
    method: "GET",
    requestBody: z.undefined(),
    responseData: PublicUserSchema.extend({}),
  }),

  getMyProfile: createRoute({
    ...EmptyParamQueries,
    path: "/users/me/profile",
    method: "GET",
    requestBody: z.undefined(),
    responseData: FullUserSchema,
  }),

  getBookmarks: createRoute({
    ...EmptyParamQueries,
    path: "/users/bookmarks",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.array(
      PublicMessageSchema.omit({
        messageReceipts: true,
        messageReactions: true,
      }),
    ),
  }),

  getUsers: createRoute({
    ...EmptyParamQueries,
    path: "/users",
    method: "GET",
    requestBody: z.undefined(),
    queries: z.object({
      cursor: z.string().optional(),
      take: z.coerce.number().optional().default(20),
    }),
    responseData: z.object({
      users: z.array(
        PublicUserSchema.extend({
          isCurrent: z.boolean(),
          hasConversation: z.boolean(),
          mutualConversation: z.string().optional(),
        }),
      ),
      nextCursor: z.string().optional(),
    }),
  }),

  blockUser: createRoute({
    ...EmptyParamQueries,
    path: "/users/:id/block",
    method: "POST",
    params: z.object({
      id: z.string().nonempty(),
    }),
    requestBody: z.undefined(),
    responseData: z.undefined(),
  }),
  getUserById: createRoute({
    ...EmptyParamQueries,
    path: "/users/:id",
    method: "GET",
    params: z.object({
      id: z.string(),
    }),
    requestBody: z.undefined(),
    responseData: PublicUserSchema,
  }),
  getNotifications: createRoute({
    ...EmptyParamQueries,
    path: "/notifications",
    method: "GET",
    queries: z.object({
      cursor: z.string().optional(),
      take: z.coerce.number().optional().default(20),
    }),
    requestBody: z.undefined(),
    responseData: z.object({
      notifications: z.array(PublicNotificationSchema),
      nextCursor: z.string().optional(),
    }),
  }),
  markNotificationRead: createRoute({
    ...EmptyParamQueries,
    path: "/notifications/:id/read",
    method: "POST",
    params: z.object({ id: z.string().nonempty() }),
    requestBody: z.undefined(),
    responseData: z.undefined(),
  }),
  markAllNotificationsRead: createRoute({
    ...EmptyParamQueries,
    path: "/notifications/read-all",
    method: "POST",
    requestBody: z.undefined(),
    responseData: z.undefined(),
  }),
  getUnreadNotificationCount: createRoute({
    ...EmptyParamQueries,
    path: "/notifications/unread-count",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.object({ count: z.number() }),
  }),

  createUploadSignature: createRoute({
    ...EmptyParamQueries,
    path: "/uploads/sign",
    method: "POST",
    requestBody: UploadSignatureRequest,
    responseData: UploadSignatureResponse,
  }),

  listStickers: createRoute({
    ...EmptyParamQueries,
    path: "/uploads/stickers",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.array(PublicStickerSchema),
  }),
} as const;

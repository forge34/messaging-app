import z from "zod";
import { createRoute } from "./routeConfig.js";
import { LoginRequest, SignupRequest } from "../schemas/auth-schema.js";
import {
  PublicConversationSchema,
  PublicMessageSchema,
  PublicUserSchema,
} from "../schemas/publicSchemas.js";

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
    responseData: z.undefined(),
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
    requestBody: z.null(),
    responseData: z.undefined(),
  }),
  createConversation: createRoute({
    ...EmptyParamQueries,
    path: "/conversation",
    method: "POST",
    requestBody: z.object({
      otherId: z.string().nonempty(),
    }),
    responseData: PublicConversationSchema.pick({
      id: true,
      createdAt: true,
      updatedAt: true,
    }),
  }),
  deleteConversation: createRoute({
    ...EmptyParamQueries,
    path: "/conversation",
    method: "POST",
    requestBody: z.undefined(),
    params: z.object({ id: z.string().nonempty() }),
    responseData: z.undefined(),
  }),
  getCurrentUserConversations: createRoute({
    ...EmptyParamQueries,
    path: "/conversation/currentUser",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.array(PublicConversationSchema),
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
  bookmarkMessage: createRoute({
    ...EmptyParamQueries,
    path: "/message/:id/bookmark",
    method: "POST",
    params: z.object({ id: z.string().nonempty() }),
    requestBody: z.undefined(),
    responseData: z.undefined(),
  }),
  getCurrentUser: createRoute({
    ...EmptyParamQueries,
    path: "/user/me",
    method: "GET",
    requestBody: z.undefined(),
    responseData: PublicUserSchema,
  }),

  getBookmarks: createRoute({
    ...EmptyParamQueries,
    path: "/user/bookmarks",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.array(PublicMessageSchema),
  }),

  getUsers: createRoute({
    ...EmptyParamQueries,
    path: "/user",
    method: "GET",
    requestBody: z.undefined(),
    responseData: z.array(PublicUserSchema),
  }),

  blockUser: createRoute({
    ...EmptyParamQueries,
    path: "/user/:id/block",
    method: "POST",
    params: z.object({
      id: z.string().nonempty(),
    }),
    requestBody: z.undefined(),
    responseData: z.undefined(),
  }),
} as const;

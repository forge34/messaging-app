import z from "zod";
import { createRoute } from "./routeConfig.js";
import { LoginRequest, SignupRequest } from "../schemas/auth-schema.js";
import {
  CreateConversationResponseSchema,
  GetCurrentUserConversationResponseSchema,
  PublicExtendedConversationSchema,
} from "../schemas/conversationSchema.js";

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
    responseData: CreateConversationResponseSchema,
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
    responseData: GetCurrentUserConversationResponseSchema,
  }),
  getConversationById: createRoute({
    ...EmptyParamQueries,
    path: "/conversation:id",
    method: "GET",
    params: z.object({
      id: z.string().nonempty(),
    }),
    requestBody: z.undefined(),
    responseData: PublicExtendedConversationSchema,
  }),
} as const;

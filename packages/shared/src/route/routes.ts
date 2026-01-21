import z from "zod";
import { createRoute } from "./routeConfig.js";
import { LoginRequest, SignupRequest } from "../schemas/auth-schema.js";

export const Routes = {
  login: createRoute({
    path: "/user",
    method: "POST",
    params: z.null(),
    queries: z.null(),
    requestBody: LoginRequest,
    responseData: z.null(),
  }),
  signup: createRoute({
    path: "/signup",
    method: "POST",
    params: z.null(),
    queries: z.null(),
    requestBody: SignupRequest,
    responseData: z.null(),
  }),

  logout: createRoute({
    path: "/logout",
    method: "POST",
    params: z.null(),
    queries: z.null(),
    requestBody: SignupRequest,
    responseData: z.null(),
  }),
} as const;

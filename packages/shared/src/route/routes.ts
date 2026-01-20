import z from "zod";
import { createRoute } from "./routeConfig";
import { LoginRequest } from "../schemas/auth-schema";

export const Routes = {
  login: createRoute({
    path: "/user",
    method: "GET",
    params: z.null(),
    queries: z.null(),
    requestBody: LoginRequest,
    responseData: z.object({ name: z.string() }),
  }),
} as const;


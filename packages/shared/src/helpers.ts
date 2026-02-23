import z from "zod";
import { Route } from "./route/routeConfig";

export type ResponseSchema <T extends Route> = z.infer<T["responseSchema"]>
export type RequestBody<T extends Route> = z.infer<T["requestBody"]>

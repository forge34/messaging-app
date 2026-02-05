import type { Route } from "@chat/shared";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FetchOptions<T extends Route> {
  body: z.infer<T["requestBody"]>;
  headers: RequestInit;
}

const ApiURL = import.meta.env.VITE_API_URL as string;

export async function apiFetch<T extends Route>(
  route: T,
  options: FetchOptions<T>,
) {
  try {
    const { body, headers } = options;
    const bodyData = route.requestBody.parse(body);

    const res = await fetch(ApiURL + route.path, {
      ...headers,
      method: route.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    if (res.status >= 400) {
      throw new Error(`Fetch error}`);
    }

    const parsedRes = route.responseSchema
      .omit({ code: true })
      .parse(await res.json());

    const data = parsedRes.data
      ? route.responseData.parse(parsedRes.data)
      : undefined;

    return {
      message: parsedRes.message,
      data,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

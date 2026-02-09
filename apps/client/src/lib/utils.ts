import type { Route } from "@chat/shared";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { type ApiErrorResponse, ApiError } from "./error";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FetchOptions<T extends Route> {
  body?: z.infer<T["requestBody"]>;
  headers: RequestInit;
}

const ApiURL = import.meta.env.VITE_API_URL as string;

export async function apiFetch<T extends Route>(
  route: T,
  options: FetchOptions<T>,
) {
  const { body, headers } = options;
  const bodyData = route.requestBody.parse(body);

  const fetchUrl = new URL(route.path, ApiURL);
  const res = await fetch(fetchUrl, {
    ...headers,
    method: route.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });

  const parsedJson: unknown = await res.json();
  if (res.ok) {
    const parsedRes = route.responseSchema
      .omit({ code: true })
      .parse(parsedJson);

    const data = parsedRes.data
      ? route.responseData.parse(parsedRes.data)
      : undefined;

    return {
      message: parsedRes.message,
      status: res.status,
      data,
    };
  }

  if (res.status === 401) {
    const parsedRes = route.responseSchema
      .omit({ code: true })
      .parse(parsedJson);
    return {
      message: parsedRes.message,
      status: res.status,
      data: undefined,
    };
  }
  let errorData: ApiErrorResponse = {};

  try {
    const rawJson: unknown = await res.json();

    if (typeof rawJson === "object" && rawJson !== null) {
      const candidate = rawJson as ApiErrorResponse;
      errorData = {
        message: candidate.message,
        messages: candidate.messages,
        fields: candidate.fields,
        status: res.status,
      };
    }
  } catch {
    errorData = { message: res.statusText, status: res.status };
  }

  throw new ApiError(errorData);
}

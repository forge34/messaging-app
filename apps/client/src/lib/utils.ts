import type { Route } from "@chat/shared";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { type ApiErrorResponse, ApiError } from "./error";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function generatePath(path: string, params: Record<string, string>) {
  let newPath = path;

  Object.keys(params).forEach((k) => {
    newPath = newPath.replace(`:${k}`, params[k]);
  });
  return newPath;
}

interface FetchOptions<T extends Route> {
  body?: z.infer<T["requestBody"]>;
  params: z.infer<T["params"]>;
  headers: RequestInit;
}

const ApiURL = import.meta.env.VITE_API_URL as string;

export async function apiFetch<T extends Route>(
  route: T,
  options: FetchOptions<T>,
): Promise<
  | undefined
  | {
      message: string;
      status: number;
      data: z.infer<T["responseData"]> | undefined;
    }
> {
  const { body, headers, params } = options;
  const bodyData = route.requestBody.parse(body);

  const fetchUrl = new URL(generatePath(route.path, params), ApiURL);

  const res = await fetch(fetchUrl, {
    ...headers,
    method: route.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });

  const parsedJson: unknown = await res.json();
  if (res.ok) {
    const resJson = parsedJson as z.infer<T["responseSchema"]>;
    const data = resJson.data as z.infer<T["responseData"]>;

    return {
      message: resJson.message,
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

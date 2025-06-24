import { format, parseISO } from "date-fns";

export const randomIp = () =>
  Math.floor(Math.random() * 255) +
  1 +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255);

export function last<T>(array: Array<T>): T {
  return array[array.length - 1];
}

export function getTime(dateString: string) {
  const date = parseISO(dateString);
  const time = format(date, "h:mm a");

  return time;
}

export type RouteError = {
  status: number;
  message: string;
};

export async function safeFetch(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, {
      credentials: "include",
      mode: "cors",
      ...init,
    });

    if (!res.ok) {
      const message = (await res.json()).message;

      throw {
        status: res.status,
        message: message || res.statusText,
      } satisfies RouteError;
    }

    return await res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw {
        status: 503,
        message: "Server is unreachable. Please try again later.",
      } satisfies RouteError;
    }

    throw error;
  }
}

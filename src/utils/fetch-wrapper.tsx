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

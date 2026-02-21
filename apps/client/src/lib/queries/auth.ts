import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils";
import { Routes } from "@chat/shared";
import { ApiError } from "../error";

export const getMe = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: async () => {
      return apiFetch(Routes.getCurrentUser, {
        headers: {
          credentials: "include",
        },
        params: {},
      });
    },
    staleTime: 1000 * 60 * 5,
    retry: (count: number, error) => {
      if (error instanceof ApiError) {
        if (error.data.status === 401) {
          return false;
        }
      }

      if (count >= 3) {
        return false;
      }
      return true;
    },

    throwOnError: true,
  });

export function useVerify() {
  return useQuery(getMe());
}

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../utils";
import { Routes } from "@chat/shared";

export function useLogin() {
  return useMutation({
    mutationFn: async (body: { username: string; password: string }) => {
      return apiFetch(Routes.login, {
        body,
        headers: {
          credentials: "include",
        },
      });
    },
    onSuccess: () => {
      console.log("sucesss");
    },
  });
}

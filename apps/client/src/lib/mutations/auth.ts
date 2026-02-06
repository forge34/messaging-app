import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../utils";
import { Routes } from "@chat/shared";
import { toast } from "sonner";

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
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (body: {
      username: string;
      password: string;
      confirmPassword: string;
    }) => {
      return apiFetch(Routes.signup, {
        body,
        headers: {
          credentials: "include",
        },
      });
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}

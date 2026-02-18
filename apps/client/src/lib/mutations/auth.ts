import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../utils";
import { Routes } from "@chat/shared";
import { toast } from "sonner";
import { ApiError } from "../error";
import { useNavigate } from "@tanstack/react-router";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { username: string; password: string }) => {
      return apiFetch(Routes.login, {
        body,
        headers: {
          credentials: "include",
        },
        params: {},
      });
    },
    onSuccess: async (data) => {
      if (!data) return;
      await queryClient.refetchQueries({ queryKey: ["user"] });
    },
    onSettled: async (data) => {
      if (!data) return;
      toast.success(data.message);
      navigate({ to: "/app/conversations" });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toast.error(err.data.messages ?? err.data.message, {
          className: "!bg-destructive !text-white",
        });
      }
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiFetch(Routes.logout, {
        body: {},
        headers: {
          credentials: "include",
        },
        params: {},
      });
    },
    onSuccess: async (data) => {
      if (!data) return;
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onSettled: async (data) => {
      if (!data) return;
      toast.success(data.message);
      navigate({ to: "/" });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toast.error(err.data.messages ?? err.data.message, {
          className: "!bg-destructive !text-white",
        });
      }
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
        params: {},
      });
    },
    onSuccess: (data) => {
      if (!data) return;
      toast.success(data.message);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toast.error(err.data.messages ?? err.data.message, {
          className: "!bg-destructive !text-white",
        });
      }
    },
  });
}

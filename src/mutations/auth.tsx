import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RouteError, safeFetch } from "../utils/functions";
import toast from "react-hot-toast";
import { queryClient } from "../router";

const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  await fetch(`${import.meta.env.VITE_API}/login`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      username,
      password,
    }),
    credentials: "include",
    headers: { "content-Type": "Application/json" },
  });
};

export const useLogin = async () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onError: (error: RouteError) => {
      if (Array.isArray(error.errors)) {
        toast.error(
          <div>
            <h3>Failed to create account</h3>
            {(error.errors as { msg: string }[]).map((err, i) => (
              <p key={i}>{err.msg}</p>
            ))}
          </div>,
        );
      }
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries();
      toast.success("Login successful");
      navigate("/");
    },
  });
};

const signup = async ({
  username,
  password,
  confirmPassword,
}: {
  username: string;
  password: string;
  confirmPassword: string;
}) => {
  await safeFetch(`${import.meta.env.VITE_API}/signup`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      confirmPassword,
    }),
    headers: { "content-Type": "Application/json" },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: signup,
    onError: (error: RouteError) => {
      if (Array.isArray(error.errors)) {
        toast.error(
          <div>
            <h3>Failed to create account</h3>
            {(error.errors as { msg: string }[]).map((err, i) => (
              <p key={i}>{err.msg}</p>
            ))}
          </div>,
        );
      }
    },
    onSuccess: () => {
      toast.success("Account created!");
      navigate("/login");
    },
  });
};

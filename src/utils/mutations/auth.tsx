import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RouteError, safeFetch } from "../functions";
import toast from "react-hot-toast";

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

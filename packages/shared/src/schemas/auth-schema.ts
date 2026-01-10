import { z } from "zod";

export const LoginRequest = z.object({
  username: z.string().min(1, { message: "Username can not be empty" }),
  password: z
    .string()
    .min(8, { message: "Password should be at least 8 characters" }),
});

export const SignupRequest = z
  .object({
    username: z.string().min(1, { message: "Username can not be empty" }),
    password: z
      .string()
      .min(8, { message: "Password should be at least 8 characters" }),
    confirmPassword: z.string().min(8, "Passwords do not match"),
  })
  .refine((values) => {
    return values.password === values.confirmPassword;
  });

export type LoginRequest = z.infer<typeof LoginRequest>;
export type SignupRequest = z.infer<typeof SignupRequest>;

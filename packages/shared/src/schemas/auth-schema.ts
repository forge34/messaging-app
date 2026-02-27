import { z } from "zod";

export const LoginRequest = z.object({
  username: z
    .string()
    .min(1, { message: "Username can not be empty" })
    .refine((s) => !/\s/.test(s), "String cannot contain any whitespace"),
  password: z
    .string()
    .min(8, { message: "Password should be at least 8 characters" }),
});

export const SignupRequest = z
  .object({
    username: z
      .string()
      .min(1, { message: "Username can not be empty" })
      .refine((s) => !/\s/.test(s), "String cannot contain any whitespace"),
    password: z
      .string()
      .min(8, { message: "Password should be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password should be at least 8 characters" }),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    { message: "Passwords do not match" },
  );

export type LoginRequest = z.infer<typeof LoginRequest>;
export type SignupRequest = z.infer<typeof SignupRequest>;

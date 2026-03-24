import { z } from "zod";

export const loginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
});

export type LoginInput  = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
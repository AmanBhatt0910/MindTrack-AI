import { LoginInput, SignupInput } from "../schemas/auth.schema";
import { AuthResponse } from "@/types/auth.types";

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    await new Promise((res) => setTimeout(res, 1000));
    return { user: { id: "1", email: data.email }, token: "dummy-token" };
  },

  signup: async (data: SignupInput): Promise<AuthResponse> => {
    await new Promise((res) => setTimeout(res, 1000));
    return { user: { id: "1", email: data.email }, token: "dummy-token" };
  },
};
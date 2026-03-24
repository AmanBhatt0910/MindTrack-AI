import { api } from "@/lib/axios";
import { AuthResponse } from "@/types/auth.types";
import { LoginInput, SignupInput } from "../schemas/auth.schema";

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  signup: async (data: SignupInput): Promise<AuthResponse> => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },
};
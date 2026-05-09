import { api } from "@/lib/axios";
import { AuthResponse } from "@/types/auth.types";
import { LoginInput, SignupInput } from "../schemas/auth.schema";

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  signup: async (data: SignupInput & { role?: string }): Promise<AuthResponse> => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },

  validateToken: async (token: string): Promise<AuthResponse | null> => {
    try {
      const res = await api.post(
        "/auth/validate-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};
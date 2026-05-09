import { useState } from "react";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { LoginInput, SignupInput } from "../schemas/auth.schema";
import { useRouter } from "next/navigation";

function getDashboardPath(role?: string): string {
  return role === "doctor" || role === "admin" ? "/doctor" : "/mood";
}

export function useAuth() {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

    const login = async (data: LoginInput) => {
    try {
      setLoading(true);
      const res = await authService.login(data);
      localStorage.setItem("token", res.token);
      setAuth(res.user, res.token);
      toast.success("Login successful!");
      router.push(getDashboardPath(res.user.role));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupInput & { role?: string }) => {
    try {
      setLoading(true);
      const res = await authService.signup(data);
      localStorage.setItem("token", res.token);
      setAuth(res.user, res.token);
      toast.success("Account created!");
      router.push(getDashboardPath(res.user.role));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { login, signup, loading };
}
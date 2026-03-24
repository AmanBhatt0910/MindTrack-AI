import { useState } from "react";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { LoginInput, SignupInput } from "../schemas/auth.schema";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (data: LoginInput) => {
    try {
      setLoading(true);
      const res = await authService.login(data);
      setUser(res.user);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupInput) => {
    try {
      setLoading(true);
      const res = await authService.signup(data);
      setUser(res.user);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { login, signup, loading };
}
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignupForm() {
  const { signup, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  return (
    <motion.form
      onSubmit={handleSubmit(signup)}
      className="space-y-4 w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input
        {...register("name")}
        placeholder="Name"
        className="w-full p-3 rounded-lg bg-slate-800"
      />
      {errors.name && <p className="text-red-400">{errors.name.message}</p>}

      <input
        {...register("email")}
        placeholder="Email"
        className="w-full p-3 rounded-lg bg-slate-800"
      />
      {errors.email && <p className="text-red-400">{errors.email.message}</p>}

      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        className="w-full p-3 rounded-lg bg-slate-800"
      />
      {errors.password && (
        <p className="text-red-400">{errors.password.message}</p>
      )}

      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400">
          Login
        </Link>
      </p>

      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Sign Up"}
      </Button>
    </motion.form>
  );
}
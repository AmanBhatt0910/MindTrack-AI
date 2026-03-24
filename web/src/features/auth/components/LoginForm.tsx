"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import Input from "@/components/ui/Input";
import AuthFormWrapper from "./AuthFormWrapper";
import { AUTH_COPY, AUTH_FIELDS } from "@/constants/auth";

const EASE = [0.16, 1, 0.3, 1] as const;

const field = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const COPY = AUTH_COPY.login;

export default function LoginForm() {
  const { login, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <AuthFormWrapper
      onSubmit={handleSubmit(login)}
      loading={loading}
      submitText={COPY.submit}
      loadingText={COPY.loading}
      switchText={COPY.switchText}
      switchLink={COPY.switchHref}
      switchLinkText={COPY.switchLink}
    >
      {/* Email */}
      <motion.div variants={field}>
        <Input
          {...register("email")}
          type="email"
          label={AUTH_FIELDS.email.label}
          placeholder={AUTH_FIELDS.email.placeholder}
          autoComplete={AUTH_FIELDS.email.autoComplete}
          iconLeft={<Mail size={14} />}
          error={errors.email?.message}
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={field}>
        <Input
          {...register("password")}
          type="password"
          label={AUTH_FIELDS.password.label}
          placeholder={AUTH_FIELDS.password.placeholder}
          autoComplete={AUTH_FIELDS.password.autoComplete}
          iconLeft={<Lock size={14} />}
          showPasswordToggle
          error={errors.password?.message}
        />
      </motion.div>

      {/* Forgot password */}
      <motion.div variants={field} className="flex justify-end -mt-1">
        <Link
          href="/forgot-password"
          className="text-xs text-(--text-muted) hover:text-(--accent) transition-colors"
        >
          {COPY.forgotPassword}
        </Link>
      </motion.div>
    </AuthFormWrapper>
  );
}
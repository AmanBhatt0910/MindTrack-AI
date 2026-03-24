"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";

import { signupSchema, type SignupInput } from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import Input from "@/components/ui/Input";
import AuthFormWrapper from "./AuthFormWrapper";
import { AUTH_COPY, AUTH_FIELDS } from "@/constants/auth";

const EASE = [0.16, 1, 0.3, 1] as const;

const field = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const COPY = AUTH_COPY.signup;

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
    <AuthFormWrapper
      onSubmit={handleSubmit(signup)}
      loading={loading}
      submitText={COPY.submit}
      loadingText={COPY.loading}
      switchText={COPY.switchText}
      switchLink={COPY.switchHref}
      switchLinkText={COPY.switchLink}
    >
      {/* Name */}
      <motion.div variants={field}>
        <Input
          {...register("name")}
          type="text"
          label={AUTH_FIELDS.name.label}
          placeholder={AUTH_FIELDS.name.placeholder}
          autoComplete={AUTH_FIELDS.name.autoComplete}
          iconLeft={<User size={14} />}
          error={errors.name?.message}
        />
      </motion.div>

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
          label={AUTH_FIELDS.passwordNew.label}
          placeholder={AUTH_FIELDS.passwordNew.placeholder}
          autoComplete={AUTH_FIELDS.passwordNew.autoComplete}
          iconLeft={<Lock size={14} />}
          showPasswordToggle
          error={errors.password?.message}
        />
      </motion.div>

      {/* Terms notice */}
      <motion.div variants={field}>
        <p className="text-xs text-(--text-muted) leading-relaxed">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-(--text-secondary) hover:text-(--accent) transition-colors underline underline-offset-2"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-(--text-secondary) hover:text-(--accent) transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </AuthFormWrapper>
  );
}
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Mail, Lock, Stethoscope, Heart } from "lucide-react";

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
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupInput) => {
    signup({ ...data, role });
  };

  return (
    <AuthFormWrapper
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
      submitText={role === "doctor" ? "Create Doctor Account" : COPY.submit}
      loadingText={COPY.loading}
      switchText={COPY.switchText}
      switchLink={COPY.switchHref}
      switchLinkText={COPY.switchLink}
    >
      {/* Role Toggle */}
      <motion.div variants={field}>
        <label className="text-xs font-medium text-(--text-secondary) mb-1.5 block">
          I am a
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
              role === "patient"
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-(--border) text-(--text-muted) hover:border-(--border-active)"
            }`}
          >
            <Heart size={14} />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
              role === "doctor"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-(--border) text-(--text-muted) hover:border-(--border-active)"
            }`}
          >
            <Stethoscope size={14} />
            Doctor / Therapist
          </button>
        </div>
      </motion.div>

      {/* Name */}
      <motion.div variants={field}>
        <Input
          {...register("name")}
          type="text"
          label={role === "doctor" ? "Full Name (Dr.)" : AUTH_FIELDS.name.label}
          placeholder={role === "doctor" ? "Dr. Jane Smith" : AUTH_FIELDS.name.placeholder}
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
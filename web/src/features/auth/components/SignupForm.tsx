"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";

import { signupSchema, type SignupInput } from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { AUTH_COPY, AUTH_FIELDS } from "@/constants/auth";

// ─── Field stagger ────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const field: Variants = {
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
    <motion.form
      onSubmit={handleSubmit(signup)}
      noValidate
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
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
      <motion.p
        variants={field}
        className="text-xs text-[var(--text-muted)] leading-relaxed"
      >
        By creating an account you agree to our{" "}
        <Link
          href="/terms"
          className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors underline underline-offset-2"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </motion.p>

      {/* Submit */}
      <motion.div variants={field}>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {loading ? COPY.loading : COPY.submit}
        </Button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={field} className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span
          className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          or
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </motion.div>

      {/* Switch to login */}
      <motion.p
        variants={field}
        className="text-center text-sm text-[var(--text-secondary)]"
      >
        {COPY.switchText}{" "}
        <Link
          href={COPY.switchHref}
          className="text-[var(--accent)] font-medium hover:underline underline-offset-4 transition-all"
        >
          {COPY.switchLink}
        </Link>
      </motion.p>
    </motion.form>
  );
}
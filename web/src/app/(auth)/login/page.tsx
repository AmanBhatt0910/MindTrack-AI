import AuthCard from "@/features/auth/components/AuthCard";
import LoginForm from "@/features/auth/components/LoginForm";
import { AUTH_COPY } from "@/constants/auth";

export const metadata = {
  title: "Sign in — MindTrack AI",
  description: "Sign in to your MindTrack AI account.",
};

const COPY = AUTH_COPY.login;

export default function LoginPage() {
  return (
    <AuthCard heading={COPY.heading} subheading={COPY.subheading}>
      <LoginForm />
    </AuthCard>
  );
}
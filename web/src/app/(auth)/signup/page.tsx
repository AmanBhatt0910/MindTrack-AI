import AuthCard from "@/features/auth/components/AuthCard";
import SignupForm from "@/features/auth/components/SignupForm";
import { AUTH_COPY } from "@/constants/auth";

export const metadata = {
  title: "Create account — MindTrack AI",
  description: "Create your MindTrack AI account.",
};

const COPY = AUTH_COPY.signup;

export default function SignupPage() {
  return (
    <AuthCard heading={COPY.heading} subheading={COPY.subheading}>
      <SignupForm />
    </AuthCard>
  );
}
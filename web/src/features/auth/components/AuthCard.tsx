"use client";

import { motion } from "framer-motion";
import DecorativePanel from "./DecorativePanel";
import FormPanel from "./FormPanel";

interface AuthCardProps {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}

export default function AuthCard({ heading, subheading, children }: AuthCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="flex min-h-screen bg-(--bg)"
    >
      <DecorativePanel />
      <FormPanel heading={heading} subheading={subheading}>
        {children}
      </FormPanel>
    </motion.div>
  );
}
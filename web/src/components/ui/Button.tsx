"use client"
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonProps = HTMLMotionProps<"button">;

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-medium disabled:opacity-50"
      {...props}
    >
      {children}
    </motion.button>
  );
}
import { motion } from "framer-motion";

export default function ExplanationCard({ text }: { text: string }) {
  return (
    <motion.div
      className="p-3 rounded-lg text-sm"
      style={{
        backgroundColor: "var(--border)",
        color: "var(--text)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      • {text}
    </motion.div>
  );
}
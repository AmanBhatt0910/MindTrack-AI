import Button from "@/components/ui/Button";

export default function CTA({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <section className="py-20 text-center space-y-6">
      <h2 className="text-3xl font-bold">
        Start analyzing mental health today
      </h2>

      <p className="text-slate-400">
        Simple, fast, and AI-powered insights at your fingertips.
      </p>

      <Button onClick={onStart}>Try Now</Button>
    </section>
  );
}
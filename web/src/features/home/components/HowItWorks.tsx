import Card from "@/components/ui/Card";

const steps = [
  "Paste social media post",
  "Select language",
  "Get AI analysis + explanation",
];

export default function HowItWorks() {
  return (
    <section className="py-16 space-y-6">
      <h2 className="text-2xl font-bold text-center">
        How It Works
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <Card key={i} className="text-center">
            <p className="text-indigo-400 font-bold text-lg">
              {i + 1}
            </p>
            <p className="text-slate-300">{step}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
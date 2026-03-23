import Card from "@/components/ui/Card";
import { Brain, Globe, BarChart } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Detection",
    desc: "Identify mental health patterns using advanced models.",
  },
  {
    icon: Globe,
    title: "Multi-language",
    desc: "Analyze posts across multiple languages seamlessly.",
  },
  {
    icon: BarChart,
    title: "Explainable AI",
    desc: "Understand WHY a prediction was made.",
  },
];

export default function Features() {
  return (
    <section className="grid md:grid-cols-3 gap-6 py-16">
      {features.map((f, i) => {
        const Icon = f.icon;

        return (
          <Card
            key={i}
            className="text-center space-y-3 hover:scale-105 transition"
          >
            <Icon className="mx-auto text-indigo-400" />
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </Card>
        );
      })}
    </section>
  );
}
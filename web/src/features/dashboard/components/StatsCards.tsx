import Card from "@/components/ui/Card";

export default function StatsCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <p className="text-slate-400 text-sm">Total Analyses</p>
        <h2 className="text-2xl font-bold">24</h2>
      </Card>

      <Card>
        <p className="text-slate-400 text-sm">High Risk</p>
        <h2 className="text-2xl font-bold text-red-400">5</h2>
      </Card>

      <Card>
        <p className="text-slate-400 text-sm">Neutral</p>
        <h2 className="text-2xl font-bold text-green-400">19</h2>
      </Card>
    </div>
  );
}
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}

export default function StatCard({
  title,
  value,
  change,
  positive = true,
}: StatCardProps) {
  return (
    <div className="glass-card rounded-3xl p-8 transition-all hover:-translate-y-1 hover:border-blue-500/20">
      <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>

      <h3 className="mt-6 text-5xl font-black tracking-tight text-white">
        {value}
      </h3>

      <p
        className={`mt-5 text-base font-medium ${
          positive
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
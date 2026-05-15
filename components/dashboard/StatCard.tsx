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
    <div className="rounded-2xl border border-slate-800 bg-[#0b1120]/90 p-6 shadow-[0_0_40px_rgba(15,23,42,0.45)]">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-3xl font-bold text-white">
        {value}
      </h3>

      <p
        className={`mt-2 text-sm font-medium ${
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
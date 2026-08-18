import { Card } from "@/components/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      )}
    </Card>
  );
}
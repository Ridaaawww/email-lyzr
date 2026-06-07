import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
}

export function KpiCard({ label, value, change, trend }: Props) {
  const positive = trend === "up";
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">vs previous 30 days</p>
      </CardContent>
    </Card>
  );
}

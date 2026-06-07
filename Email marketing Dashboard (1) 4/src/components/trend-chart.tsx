import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point { date: string; opens: number; replies: number; clicks?: number }

export function TrendChart({ data }: { data: Point[] }) {
  const interval = data.length > 30 ? Math.ceil(data.length / 8) : 4;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="g-opens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="g-replies" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={interval} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="opens" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#g-opens)" />
        <Area type="monotone" dataKey="replies" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#g-replies)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface Stage { stage: string; value: number; pct: number }

export function FunnelChart({ data }: { data: Stage[] }) {
  const max = Math.max(1, data[0]?.value ?? 1);
  return (
    <div className="space-y-2">
      {data.map((s, i) => {
        const width = (s.value / max) * 100;
        return (
          <div key={s.stage} className="space-y-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{s.stage}</span>
              <span className="tabular-nums text-muted-foreground">
                {s.value.toLocaleString()} <span className="ml-1 text-xs">({s.pct}%)</span>
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="h-full rounded-md transition-all"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, var(--color-chart-1), var(--color-chart-2))`,
                  opacity: 1 - i * 0.1,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

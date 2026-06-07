import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { useFilteredData } from "@/lib/filters-context";
import { getOpportunityBreakdown, getMeetingBookedAttribution } from "@/lib/instantly.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deliverability")({
  head: () => ({ meta: [{ title: "Deliverability Health — Loopwise" }] }),
  component: Deliverability,
});

const OUTCOMES: { key: "interested" | "meetingBooked" | "meetingCompleted" | "closed"; label: string; cls: string }[] = [
  { key: "interested", label: "Interested", cls: "bg-info" },
  { key: "meetingBooked", label: "Meeting Booked", cls: "bg-chart-2" },
  { key: "meetingCompleted", label: "Meeting Completed", cls: "bg-chart-3" },
  { key: "closed", label: "Closed", cls: "bg-success" },
];

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const sevIcon = {
  critical: { icon: ShieldAlert, cls: "text-destructive bg-destructive/10" },
  warning: { icon: AlertTriangle, cls: "text-warning-foreground bg-warning/15" },
  info: { icon: Info, cls: "text-info bg-info/10" },
};

const statusCls: Record<string, string> = {
  healthy: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

function Deliverability() {
  const { deliverability: d, days, isLoading, campaigns } = useFilteredData();
  const meetingCampaigns = campaigns.filter((c) => c.meetings > 0 || c.sent > 0);

  const breakdownFn = useServerFn(getOpportunityBreakdown);
  const oppCampaigns = useMemo(() => campaigns.filter((c) => c.meetings > 0).slice(0, 10), [campaigns]);
  const campaignIds = useMemo(() => oppCampaigns.map((c) => c.id), [oppCampaigns]);
  const breakdownQ = useQuery({
    queryKey: ["instantly", "opp-breakdown", campaignIds.join(",")],
    queryFn: () => breakdownFn({ data: { campaignIds } }),
    enabled: campaignIds.length > 0,
    staleTime: 5 * 60_000,
  });
  const breakdownMap = useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    (breakdownQ.data ?? []).forEach((r: any) => m.set(r.campaignId, r));
    return m;
  }, [breakdownQ.data]);

  const attributionFn = useServerFn(getMeetingBookedAttribution);
  const attrQ = useQuery({
    queryKey: ["instantly", "meeting-attribution", campaignIds.join(",")],
    queryFn: () => attributionFn({ data: { campaignIds } }),
    enabled: campaignIds.length > 0,
    staleTime: 5 * 60_000,
  });
  const attributionRows = useMemo(() => {
    const rows: { campaignId: string; campaignName: string; lead: any }[] = [];
    const nameById = new Map(oppCampaigns.map((c) => [c.id, c.name]));
    (attrQ.data ?? []).forEach((r: any) => {
      const cname = nameById.get(r.campaignId) ?? "Untitled";
      (r.leads ?? []).forEach((lead: any) =>
        rows.push({ campaignId: r.campaignId, campaignName: cname, lead }),
      );
    });
    rows.sort((a, b) => {
      const at = a.lead.timestampUpdated ? new Date(a.lead.timestampUpdated).getTime() : 0;
      const bt = b.lead.timestampUpdated ? new Date(b.lead.timestampUpdated).getTime() : 0;
      return bt - at;
    });
    return rows;
  }, [attrQ.data, oppCampaigns]);

  const pipelineTotals = useMemo(() => {
    const t: Record<string, number> = { interested: 0, meetingBooked: 0, meetingCompleted: 0, closed: 0 };
    (breakdownQ.data ?? []).forEach((r: any) => {
      OUTCOMES.forEach((o) => { t[o.key] += r[o.key] ?? 0; });
    });
    return t;
  }, [breakdownQ.data]);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Deliverability Health"
        description={`Live from Instantly — bounces, blocks, unsubscribes across the last ${days} days${isLoading ? " · loading…" : ""}`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Reputation Score</CardTitle>
            <CardDescription>Derived from bounce, block & unsubscribe rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="var(--color-muted)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="var(--color-chart-3)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(d.score / 100) * 264} 264`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-3xl font-semibold">{d.score}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Inbox" value={`${d.inbox}%`} tone="success" />
                <Row label="Blocked" value={`${d.blockRate}%`} tone="warning" />
                <Row label="Bounced" value={`${d.bounceRate}%`} tone="destructive" />
                <Row label="Unsubscribed" value={`${d.unsubRate}%`} tone="muted" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
              <Stat label="Sent" value={d.totalSent.toLocaleString()} />
              <Stat label="Bounces" value={d.totalBounces.toLocaleString()} />
              <Stat label="Blocks" value={d.totalBlocks.toLocaleString()} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Generated from current Instantly signals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.alerts.map((a, i) => {
              const { icon: Icon, cls } = sevIcon[a.severity as keyof typeof sevIcon];
              return (
                <div key={i} className="flex gap-3 rounded-lg border p-3">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", cls)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{a.title}</p>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Per-Campaign Deliverability</CardTitle>
            <CardDescription>Bounce, block & inbox placement by campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.domains.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No campaign sends in this window.</p>
            )}
            {d.domains.map((dom) => (
              <div key={dom.domain} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{dom.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {dom.sent.toLocaleString()} sent · {dom.bounces} bounces · {dom.blocks} blocks · {dom.unsubs} unsubs
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip label={`Bounce ${dom.bounceRate}%`} tone={dom.bounceRate >= 5 ? "bad" : dom.bounceRate >= 2 ? "warn" : "ok"} />
                    <Chip label={`Inbox ${dom.inbox}%`} tone={dom.inbox >= 95 ? "ok" : dom.inbox >= 90 ? "warn" : "bad"} />
                    <Badge variant="outline" className={cn(statusCls[dom.status])}>{dom.score}</Badge>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full",
                      dom.status === "healthy" && "bg-success",
                      dom.status === "warning" && "bg-warning",
                      dom.status === "critical" && "bg-destructive",
                    )}
                    style={{ width: `${dom.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox Provider Mix</CardTitle>
            <CardDescription>Estimated share of sent volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={d.providerDist} dataKey="value" nameKey="provider" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {d.providerDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {d.providerDist.map((p, i) => (
                <div key={p.provider} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{p.provider}</span>
                  <span className="ml-auto tabular-nums font-medium">{p.value}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Provider mix is an industry estimate — Instantly doesn't expose per-ISP placement.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-info" />
            <CardTitle>Opportunity Pipeline</CardTitle>
          </div>
          <CardDescription>
            Interested → Meeting Booked → Meeting Completed → Closed — live from Instantly's lead interest stages
            {breakdownQ.isLoading ? " · loading…" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OUTCOMES.map((o, i) => {
              const v = pipelineTotals[o.key] ?? 0;
              const prev = i === 0 ? v : pipelineTotals[OUTCOMES[i - 1].key] ?? 0;
              const conv = i === 0 || !prev ? null : +((v / prev) * 100).toFixed(0);
              return (
                <div key={o.key} className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-sm", o.cls)} />
                    <p className="text-xs text-muted-foreground">{o.label}</p>
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{v.toLocaleString()}</p>
                  {conv !== null && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{conv}% of previous stage</p>
                  )}
                </div>
              );
            })}
          </div>
          {oppCampaigns.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No campaigns with opportunities in the current window. Mark a lead as <em>Interested</em> in Instantly to populate this breakdown.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {OUTCOMES.map((o) => (
                  <div key={o.key} className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-sm", o.cls)} />
                    <span className="text-muted-foreground">{o.label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {oppCampaigns.map((c) => {
                  const b = breakdownMap.get(c.id);
                  const totalKnown = b ? OUTCOMES.reduce((s, o) => s + (b[o.key] ?? 0), 0) : 0;
                  const denom = Math.max(totalKnown, c.meetings, 1);
                  return (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {c.meetings} total · {totalKnown} classified
                        </span>
                      </div>
                      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        {b
                          ? OUTCOMES.map((o) => {
                              const v = b[o.key] ?? 0;
                              if (!v) return null;
                              return <div key={o.key} className={cn("h-full", o.cls)} style={{ width: `${(v / denom) * 100}%` }} />;
                            })
                          : <div className="h-full w-full animate-pulse bg-muted-foreground/10" />}
                      </div>
                      {b && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
                          {OUTCOMES.map((o) => (
                            <span key={o.key}>
                              {o.label}: <span className="font-medium text-foreground">{b[o.key] ?? 0}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Counts come from Instantly’s <code>/leads/list</code> endpoint filtered by lead interest stage
                (<code>FILTER_LEAD_INTERESTED</code>, <code>_MEETING_BOOKED</code>, <code>_MEETING_COMPLETED</code>, <code>_CLOSED</code>).
                Stages with zero leads are omitted from the bar. “Classified” may differ from <code>total_opportunities</code> when leads sit in custom or transitional stages.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-chart-2" />
            <CardTitle>Meetings Booked — Attribution</CardTitle>
          </div>
          <CardDescription>
            Which leads booked meetings, and from which campaign{attrQ.isLoading ? " · loading…" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {oppCampaigns.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No campaigns with opportunities in the current window.
            </p>
          ) : attributionRows.length === 0 && !attrQ.isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No leads currently in the <em>Meeting Booked</em> stage for these campaigns.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Lead</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Booked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributionRows.map((r) => {
                    const name = [r.lead.firstName, r.lead.lastName].filter(Boolean).join(" ") || "—";
                    const when = r.lead.timestampUpdated
                      ? new Date(r.lead.timestampUpdated).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
                      : "—";
                    return (
                      <TableRow key={`${r.campaignId}-${r.lead.id}`}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.lead.email || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{r.lead.company || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{r.campaignName}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{when}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Pulled live from Instantly’s <code>/leads/list</code> endpoint with <code>FILTER_LEAD_MEETING_BOOKED</code>, scoped to each campaign with opportunities in the selected window.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <CardTitle>Opportunities — Source Verification</CardTitle>
          </div>
          <CardDescription>
            How the "Opportunities" KPI is derived from Instantly API data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
            <p className="font-medium">Mapping</p>
            <p className="mt-1 text-muted-foreground">
              The <strong>Opportunities</strong> KPI surfaces Instantly's <code>total_opportunities</code> field from <code>/campaigns/analytics</code>.
              This counts every lead in <em>any</em> positive interest stage (Interested, Meeting Booked, Meeting Completed, Closed) — including existing
              conversations imported into Instantly. It is <strong>not</strong> a count of booked meetings. For the actual booked-meeting count, see the
              <em> Meeting Booked</em> tile in the Opportunity Pipeline above, which is derived from <code>/leads/list?filter=FILTER_LEAD_MEETING_BOOKED</code>.
            </p>
          </div>

          {meetingCampaigns.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No campaigns with sends in the current window.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Raw Field</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetingCampaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.sent.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">total_opportunities</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{c.meetings}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Totals are aggregated across all filtered campaigns. Individual campaign rows above reflect the raw Instantly response for the selected date range.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: string }) {
  const dot = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    muted: "bg-muted-foreground",
  }[tone];
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: "ok" | "warn" | "bad" }) {
  const cls = tone === "ok"
    ? "border-success/30 bg-success/10 text-success"
    : tone === "warn"
      ? "border-warning/30 bg-warning/15 text-warning-foreground"
      : "border-destructive/30 bg-destructive/10 text-destructive";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums", cls)}>
      {label}
    </span>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { MousePointerClick, Globe, FileDown, ChevronDown, ChevronRight, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { useFilteredData } from "@/lib/filters-context";
import { getCampaignSteps, getCampaignAssets } from "@/lib/instantly.functions";

export const Route = createFileRoute("/engagement")({
  head: () => ({ meta: [{ title: "Content Engagement — Lyzr Email Marketing" }] }),
  component: Engagement,
});

function Engagement() {
  const { engagementRows = [], days, isLoading } = useFilteredData() as any;
  const [openId, setOpenId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const t = { sent: 0, opens: 0, clicks: 0, clicksUnique: 0, meetings: 0, leads: 0 };
    for (const r of engagementRows) {
      t.sent += r.sent; t.opens += r.opens; t.clicks += r.clicks;
      t.clicksUnique += r.clicksUnique; t.meetings += r.meetings; t.leads += r.leads;
    }
    return t;
  }, [engagementRows]);

  const ctr = totals.sent ? +((totals.clicks / totals.sent) * 100).toFixed(2) : 0;
  const ctor = totals.opens ? +((totals.clicks / totals.opens) * 100).toFixed(2) : 0;
  const visitorRate = totals.leads ? +((totals.clicksUnique / totals.leads) * 100).toFixed(1) : 0;

  const topByClicks = engagementRows.slice(0, 10);
  const barData = topByClicks.map((r: any) => ({
    name: r.name.length > 22 ? r.name.slice(0, 22) + "…" : r.name,
    clicks: r.clicks,
    unique: r.clicksUnique,
  }));

  // Asset attribution — fetch sequence bodies for top campaigns and cross-reference clicks / opportunities
  const assetCampaigns = useMemo(() => engagementRows.slice(0, 15), [engagementRows]);
  const assetCampaignIds = useMemo(() => assetCampaigns.map((c: any) => c.id), [assetCampaigns]);
  const assetsFn = useServerFn(getCampaignAssets);
  const assetsQ = useQuery({
    queryKey: ["instantly", "campaign-assets", assetCampaignIds.join(",")],
    queryFn: () => assetsFn({ data: { campaignIds: assetCampaignIds } }),
    enabled: assetCampaignIds.length > 0,
    staleTime: 10 * 60_000,
  });

  const assetAttribution = useMemo(() => {
    const data = assetsQ.data ?? [];
    const byCampaign = new Map<string, { url: string; kind: string; label: string }[]>();
    data.forEach((r: any) => byCampaign.set(r.campaignId, r.assets ?? []));
    const campaignById = new Map(assetCampaigns.map((c: any) => [c.id, c]));

    // For each campaign, count "creditable" assets (exclude unsubscribe) and split clicks/opps evenly
    type Row = {
      url: string; kind: string; label: string;
      campaigns: { id: string; name: string; clicksShare: number; oppsShare: number; uniqueShare: number }[];
      totalClicks: number; totalUnique: number; totalOpps: number; campaignCount: number;
    };
    const map = new Map<string, Row>();

    byCampaign.forEach((assets, cid) => {
      const c: any = campaignById.get(cid);
      if (!c) return;
      const creditable = assets.filter((a) => a.kind !== "Unsubscribe");
      const n = creditable.length || 1;
      const clickShare = c.clicks / n;
      const uniqueShare = c.clicksUnique / n;
      const oppShare = c.meetings / n;
      creditable.forEach((a) => {
        const key = a.url;
        const row = map.get(key) ?? {
          url: a.url, kind: a.kind, label: a.label,
          campaigns: [], totalClicks: 0, totalUnique: 0, totalOpps: 0, campaignCount: 0,
        };
        row.campaigns.push({ id: cid, name: c.name, clicksShare: clickShare, oppsShare: oppShare, uniqueShare });
        row.totalClicks += clickShare;
        row.totalUnique += uniqueShare;
        row.totalOpps += oppShare;
        row.campaignCount += 1;
        map.set(key, row);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.totalOpps - a.totalOpps || b.totalClicks - a.totalClicks);
  }, [assetsQ.data, assetCampaigns]);

  const assetKindTotals = useMemo(() => {
    const m = new Map<string, { kind: string; clicks: number; opps: number; assets: number }>();
    assetAttribution.forEach((r) => {
      const cur = m.get(r.kind) ?? { kind: r.kind, clicks: 0, opps: 0, assets: 0 };
      cur.clicks += r.totalClicks;
      cur.opps += r.totalOpps;
      cur.assets += 1;
      m.set(r.kind, cur);
    });
    return Array.from(m.values()).sort((a, b) => b.opps - a.opps);
  }, [assetAttribution]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Content Engagement"
        description={`Website traffic, playbook downloads & link clicks across ${engagementRows.length} campaigns · last ${days} days${isLoading ? " · loading…" : ""}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Website Visits" value={totals.clicks.toLocaleString()} change={0} trend="up" />
        <KpiCard label="Unique Visitors" value={totals.clicksUnique.toLocaleString()} change={0} trend="up" />
        <KpiCard label="Click-Through Rate" value={`${ctr}%`} change={0} trend={ctr >= 1 ? "up" : "down"} />
        <KpiCard label="Click-to-Open Rate" value={`${ctor}%`} change={0} trend={ctor >= 10 ? "up" : "down"} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-info" />
            <CardTitle>Traffic by Campaign</CardTitle>
          </div>
          <CardDescription>
            Total link clicks (proxy for website visits & playbook downloads) — top {topByClicks.length} campaigns by clicks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {barData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No click activity in this window.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ left: -8, right: 8, top: 8, bottom: 60 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} angle={-25} textAnchor="end" interval={0} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="clicks" name="Total clicks" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unique" name="Unique clickers" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-chart-2" />
            <CardTitle>Per-Campaign Engagement Detail</CardTitle>
          </div>
          <CardDescription>
            Click each row to inspect step-level performance (which email in the sequence drove the click).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {engagementRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No campaigns with sends in this window.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead></TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Unique</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">CTOR</TableHead>
                    <TableHead className="text-right">Replies</TableHead>
                    <TableHead className="text-right">Opps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engagementRows.map((r: any) => (
                    <Fragment key={r.id}>
                      <TableRow className="cursor-pointer" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                        <TableCell className="w-8">
                          {openId === r.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell className="font-medium max-w-[280px] truncate">{r.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-normal">{r.status}</Badge></TableCell>
                        <TableCell className="text-right tabular-nums">{r.sent.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{r.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{r.clicksUnique.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.ctr}%</TableCell>
                        <TableCell className="text-right tabular-nums">{r.ctor}%</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{r.replies}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.meetings}</TableCell>
                      </TableRow>
                      {openId === r.id && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell></TableCell>
                          <TableCell colSpan={9} className="py-4">
                            <StepsBreakdown campaignId={r.id} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Click counts come from Instantly's <code>link_click_count</code> and <code>link_click_count_unique</code> fields.
            Every tracked link in your email body (playbook PDFs, website CTAs, calendar links) contributes to these totals.
            Instantly aggregates clicks across all links per campaign — to attribute clicks to a specific asset, use distinct UTM-tagged URLs per asset.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-chart-4" />
            <CardTitle>Asset-Level Attribution</CardTitle>
          </div>
          <CardDescription>
            Which specific playbook, landing page, or booking link drove booked opportunities — extracted from each campaign's sequence body
            {assetsQ.isLoading ? " · scanning sequences…" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {assetAttribution.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {assetsQ.isLoading ? "Loading asset map…" : "No tracked links found in the top campaigns."}
            </p>
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">By asset type</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {assetKindTotals.map((k) => (
                    <div key={k.kind} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{k.kind}</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">{Math.round(k.opps)}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        opps · {Math.round(k.clicks).toLocaleString()} clicks · {k.assets} asset{k.assets === 1 ? "" : "s"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Campaigns</TableHead>
                      <TableHead className="text-right">Est. clicks</TableHead>
                      <TableHead className="text-right">Est. unique</TableHead>
                      <TableHead className="text-right">Est. opps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assetAttribution.slice(0, 25).map((r) => (
                      <Fragment key={r.url}>
                        <TableRow className="cursor-pointer" onClick={() => setOpenId(openId === r.url ? null : r.url)}>
                          <TableCell className="max-w-[360px]">
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                              {r.label}
                            </a>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-normal">{r.kind}</Badge></TableCell>
                          <TableCell className="text-right tabular-nums">{r.campaignCount}</TableCell>
                          <TableCell className="text-right tabular-nums">{Math.round(r.totalClicks).toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{Math.round(r.totalUnique).toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className={r.totalOpps >= 1 ? "text-success font-medium" : "text-muted-foreground"}>{r.totalOpps.toFixed(1)}</span>
                          </TableCell>
                        </TableRow>
                        {openId === r.url && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={6} className="py-3">
                              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Campaigns featuring this asset</p>
                              <div className="space-y-1.5">
                                {r.campaigns.map((c) => (
                                  <div key={c.id} className="flex items-center justify-between gap-3 text-xs">
                                    <span className="truncate font-medium">{c.name}</span>
                                    <span className="shrink-0 tabular-nums text-muted-foreground">
                                      ~{Math.round(c.clicksShare)} clicks · ~{c.oppsShare.toFixed(1)} opps
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">How attribution is calculated:</span> Instantly aggregates clicks and opportunities at the campaign level, not per URL.
                  We scan each campaign's email body for unique tracked links and split that campaign's clicks &amp; opportunities evenly across them
                  (excluding unsubscribe links). Numbers labeled "Est." are modeled, not exact. For precise per-asset attribution, tag each link with a
                  unique <code>utm_content</code> and pipe meeting bookings back through your CRM with the captured UTM.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-success" />
            <CardTitle>Engagement → Opportunity Conversion</CardTitle>
          </div>
          <CardDescription>How many unique visitors converted into booked opportunities, per campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Unique visitors</TableHead>
                  <TableHead className="text-right">Opportunities</TableHead>
                  <TableHead className="text-right">Visitor → Opp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engagementRows.filter((r: any) => r.clicksUnique > 0).slice(0, 12).map((r: any) => {
                  const conv = r.clicksUnique ? +((r.meetings / r.clicksUnique) * 100).toFixed(2) : 0;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium max-w-[320px] truncate">{r.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.clicksUnique.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.meetings}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className={conv >= 1 ? "text-success font-medium" : "text-muted-foreground"}>{conv}%</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-info/20 bg-info/5 p-3 text-xs">
            <MousePointerClick className="h-4 w-4 shrink-0 text-info" />
            <p className="text-muted-foreground">
              Aggregate visitor-to-opportunity: <span className="font-medium text-foreground">{visitorRate}%</span> ·
              Use this to spot campaigns where leads click but never book — usually a sign of weak landing-page copy or missing call-to-action.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepsBreakdown({ campaignId }: { campaignId: string }) {
  const stepsFn = useServerFn(getCampaignSteps);
  const q = useQuery({
    queryKey: ["instantly", "steps", campaignId],
    queryFn: () => stepsFn({ data: { campaignId } }),
    staleTime: 5 * 60_000,
  });

  if (q.isLoading) return <p className="text-xs text-muted-foreground">Loading step breakdown…</p>;
  const rows = (q.data ?? []).filter((s: any) => s.step !== "\\N" && Number(s.sent) > 0)
    .sort((a: any, b: any) => Number(a.step) - Number(b.step));
  if (rows.length === 0) return <p className="text-xs text-muted-foreground">No step data available.</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step-level performance</p>
      <div className="overflow-hidden rounded border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Step</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Opens</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Unique clicks</TableHead>
              <TableHead className="text-right">Replies</TableHead>
              <TableHead className="text-right">Click rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s: any) => {
              const sent = Number(s.sent) || 0;
              const rate = sent ? +((Number(s.clicks) / sent) * 100).toFixed(2) : 0;
              return (
                <TableRow key={s.step}>
                  <TableCell className="font-medium">Step {Number(s.step) + 1}</TableCell>
                  <TableCell className="text-right tabular-nums">{sent.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{Number(s.unique_opened).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{Number(s.clicks).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{Number(s.unique_clicks).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{Number(s.replies).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{rate}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

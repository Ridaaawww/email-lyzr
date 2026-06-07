import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CampaignTable } from "@/components/campaign-table";
import { PageHeader } from "@/components/page-header";
import { TrendChart } from "@/components/trend-chart";
import { KpiCard } from "@/components/kpi-card";
import { useFilteredData } from "@/lib/filters-context";

export const Route = createFileRoute("/campaigns")({
  head: () => ({ meta: [{ title: "Campaign Analytics — Loopwise" }] }),
  component: Campaigns,
});

function Campaigns() {
  const { kpis, trendData, replyByDay, campaigns, days } = useFilteredData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Campaign Analytics" description={`Performance across ${campaigns.length} matching campaigns · last ${days} days`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Campaigns" value={String(campaigns.length)} change={2.0} trend="up" />
        <KpiCard label={kpis[1].label} value={kpis[1].value} change={kpis[1].change} trend={kpis[1].trend} />
        <KpiCard label={kpis[2].label} value={kpis[2].value} change={kpis[2].change} trend={kpis[2].trend} />
        <KpiCard label={kpis[3].label} value={kpis[3].value} change={kpis[3].change} trend={kpis[3].trend} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Open & Reply Trends</CardTitle>
            <CardDescription>Rolling engagement over selected window</CardDescription>
          </CardHeader>
          <CardContent><TrendChart data={trendData} /></CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Best Day to Send</CardTitle>
            <CardDescription>Replies and opens by weekday</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={replyByDay} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="opens" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replies" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Live from Instantly — filtered by campaign and status</CardDescription>
        </CardHeader>
        <CardContent><CampaignTable data={campaigns} /></CardContent>
      </Card>
    </div>
  );
}

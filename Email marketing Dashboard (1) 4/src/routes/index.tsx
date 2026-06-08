import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { TrendChart } from "@/components/trend-chart";
import { FunnelChart } from "@/components/funnel-chart";
import { CampaignTable } from "@/components/campaign-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useFilteredData } from "@/lib/filters-context";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview — Lyzr Email Marketing" }] }),
  component: Overview,
});

function Overview() {
  const { kpis, trendData, funnelData, campaigns, days } = useFilteredData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Overview" description={`Last ${days} days · filtered view`}>
        <Button variant="outline" size="sm"><Download className="mr-2 h-3.5 w-3.5" />Export</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Opens & Replies</CardTitle>
            <CardDescription>Daily engagement across filtered campaigns</CardDescription>
          </CardHeader>
          <CardContent><TrendChart data={trendData} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Sent → Meeting</CardDescription>
          </CardHeader>
          <CardContent><FunnelChart data={funnelData} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Campaigns</CardTitle>
          <CardDescription>Matching the current filters</CardDescription>
        </CardHeader>
        <CardContent><CampaignTable data={campaigns} limit={5} /></CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { aiInsights } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "AI Insights — Lyzr Email Marketing" }] }),
  component: Insights,
});

const impactCls = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/15 text-warning-foreground border-warning/30",
  low: "bg-info/10 text-info border-info/20",
};

function Insights() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="AI Insights" description="Recommendations generated from your last 90 days of campaign data">
        <Button size="sm"><Sparkles className="mr-2 h-3.5 w-3.5" />Regenerate</Button>
      </PageHeader>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">This week's biggest opportunity</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Shifting your 3 highest-volume sequences to a Tuesday 10 AM local send window could lift weekly replies by <span className="font-semibold text-foreground">+18%</span> (~230 additional replies).
              </p>
            </div>
          </div>
          <Button>Apply suggestion <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {aiInsights.map((i) => (
          <Card key={i.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs">{i.category}</Badge>
                <Badge variant="outline" className={cn("text-xs uppercase tracking-wider", impactCls[i.impact])}>
                  {i.impact} impact
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base leading-snug">{i.title}</CardTitle>
              <CardDescription className="leading-relaxed">{i.desc}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button variant="ghost" size="sm" className="px-0 text-primary hover:bg-transparent hover:text-primary/80">
                {i.action} <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

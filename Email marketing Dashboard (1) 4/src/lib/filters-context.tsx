import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { deliverability, aiInsights, replyByDay as baseReplyByDay } from "./mock-data";
import { getCampaignsAnalytics, getDailyAnalytics, listCampaigns, listTags } from "./instantly.functions";

export type RangePreset = "7d" | "30d" | "90d" | "custom";

export interface FilterState {
  preset: RangePreset;
  from?: Date;
  to?: Date;
  campaign: string; // "all" or campaign id
  status: string; // "all" or status label
  tag: string; // "all" or tag id
}

interface Ctx {
  filters: FilterState;
  setFilters: (f: Partial<FilterState>) => void;
  reset: () => void;
}

const FiltersContext = createContext<Ctx | null>(null);
const DEFAULT: FilterState = { preset: "30d", campaign: "all", status: "all", tag: "all" };

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setRaw] = useState<FilterState>(DEFAULT);
  const setFilters = (f: Partial<FilterState>) => setRaw((p) => ({ ...p, ...f }));
  const reset = () => setRaw(DEFAULT);
  return <FiltersContext.Provider value={{ filters, setFilters, reset }}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be inside FiltersProvider");
  return ctx;
}

export function rangeDays(f: FilterState): number {
  if (f.preset === "custom" && f.from && f.to) {
    return Math.max(1, Math.round((f.to.getTime() - f.from.getTime()) / 86400000) + 1);
  }
  return f.preset === "7d" ? 7 : f.preset === "90d" ? 90 : 30;
}

const STATUS_MAP: Record<number, string> = {
  0: "Draft", 1: "Active", 2: "Paused", 3: "Completed", 4: "Active",
  [-99]: "Suspended", [-1]: "Issues", [-2]: "Bounce Protect",
};
export const STATUSES = ["Active", "Paused", "Completed", "Draft"];

function dateWindow(f: FilterState) {
  const days = rangeDays(f);
  const end = f.preset === "custom" && f.to ? f.to : new Date();
  const start = f.preset === "custom" && f.from
    ? f.from
    : (() => { const d = new Date(end); d.setDate(d.getDate() - (days - 1)); return d; })();
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
    days,
  };
}

function prevWindow(start: string, end: string) {
  const s = new Date(start); const e = new Date(end);
  const span = e.getTime() - s.getTime();
  const ps = new Date(s.getTime() - span - 86400000);
  const pe = new Date(s.getTime() - 86400000);
  return { startDate: format(ps, "yyyy-MM-dd"), endDate: format(pe, "yyyy-MM-dd") };
}

function num(...vals: any[]): number {
  for (const v of vals) {
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string" && v && !isNaN(Number(v))) return Number(v);
  }
  return 0;
}

function aggregate(rows: any[]) {
  let sent = 0, opens = 0, replies = 0, clicks = 0, meetings = 0, bounces = 0, leads = 0, unsubs = 0, blocks = 0;
  for (const r of rows) {
    sent += num(r.emails_sent_count, r.sent, r.sent_count);
    opens += num(r.open_count, r.opens, r.unique_opens, r.opened);
    replies += num(r.reply_count, r.replies);
    clicks += num(r.link_click_count, r.clicks, r.unique_clicks);
    meetings += num(r.total_opportunities, r.opportunities, r.meetings);
    bounces += num(r.bounced_count, r.bounces);
    leads += num(r.leads_count, r.leads);
    unsubs += num(r.unsubscribed_count, r.unsubscribes, r.unsubscribed);
    blocks += num(r.emails_blocked_count, r.blocked_count, r.blocked);
  }
  return { sent, opens, replies, clicks, meetings, bounces, leads, unsubs, blocks };
}

function pctChange(curr: number, prev: number) {
  if (!prev) return curr ? 100 : 0;
  return +(((curr - prev) / prev) * 100).toFixed(1);
}

export function useFilteredData() {
  const { filters } = useFilters();
  const win = useMemo(() => dateWindow(filters), [filters]);
  const prev = useMemo(() => prevWindow(win.startDate, win.endDate), [win]);

  const analyticsFn = useServerFn(getCampaignsAnalytics);
  const dailyFn = useServerFn(getDailyAnalytics);
  const campaignsFn = useServerFn(listCampaigns);
  const tagsFn = useServerFn(listTags);

  const campaignId = filters.campaign === "all" ? undefined : filters.campaign;

  const campaignsQ = useQuery({
    queryKey: ["instantly", "campaigns"],
    queryFn: () => campaignsFn(),
    staleTime: 5 * 60_000,
  });

  const tagsQ = useQuery({
    queryKey: ["instantly", "tags"],
    queryFn: () => tagsFn(),
    staleTime: 5 * 60_000,
  });

  const analyticsQ = useQuery({
    queryKey: ["instantly", "analytics", win.startDate, win.endDate, campaignId ?? "all"],
    queryFn: () => analyticsFn({ data: { ...win, campaignId } }),
    staleTime: 60_000,
  });

  const prevAnalyticsQ = useQuery({
    queryKey: ["instantly", "analytics-prev", prev.startDate, prev.endDate, campaignId ?? "all"],
    queryFn: () => analyticsFn({ data: { ...prev, campaignId } }),
    staleTime: 60_000,
  });

  const dailyQ = useQuery({
    queryKey: ["instantly", "daily", win.startDate, win.endDate, campaignId ?? "all"],
    queryFn: () => dailyFn({ data: { ...win, campaignId } }),
    staleTime: 60_000,
  });

  const isLoading = analyticsQ.isLoading || campaignsQ.isLoading || dailyQ.isLoading;
  const error = analyticsQ.error ?? campaignsQ.error ?? dailyQ.error ?? null;

  const data = useMemo(() => {
    const days = win.days;
    const analytics: any[] = analyticsQ.data ?? [];
    const prevAnalytics: any[] = prevAnalyticsQ.data ?? [];
    const campaignsMeta: any[] = campaignsQ.data ?? [];
    const daily: any[] = dailyQ.data ?? [];

    const metaMap = new Map<string, any>(campaignsMeta.map((c: any) => [c.id, c]));

    const matchesRow = (a: any) => {
      const meta = metaMap.get(a.campaign_id) ?? {};
      if (filters.status !== "all") {
        const st = STATUS_MAP[(a.campaign_status ?? meta.status) as number];
        if (st !== filters.status) return false;
      }
      if (filters.tag !== "all") {
        const tagList: string[] = meta.email_tag_list ?? [];
        if (!tagList.includes(filters.tag)) return false;
      }
      return true;
    };

    // Build campaign rows by merging analytics + meta, then applying filters
    const campaignRows = analytics
      .filter(matchesRow)
      .map((a: any) => {
        const meta = metaMap.get(a.campaign_id) ?? {};
        const sent = num(a.emails_sent_count, a.sent);
        const opens = num(a.open_count);
        const replies = num(a.reply_count);
        const meetings = num(a.total_opportunities);
        const statusCode = a.campaign_status ?? meta.status;
        const status = STATUS_MAP[statusCode as number] ?? "Draft";
        return {
          id: a.campaign_id,
          name: a.campaign_name ?? meta.name ?? "Untitled",
          status,
          sent,
          openRate: sent ? +((opens / sent) * 100).toFixed(1) : 0,
          replyRate: sent ? +((replies / sent) * 100).toFixed(1) : 0,
          meetings,
          owner: (meta.created_by ?? "—").toString().slice(0, 18),
        };
      })
      .sort((a, b) => b.sent - a.sent);

    const engagementRows = analytics
      .filter(matchesRow)
      .map((a: any) => {
        const meta = metaMap.get(a.campaign_id) ?? {};
        const sent = num(a.emails_sent_count);
        const opens = num(a.open_count);
        const opensUnique = num(a.open_count_unique, a.open_count_unique_by_step);
        const clicks = num(a.link_click_count);
        const clicksUnique = num(a.link_click_count_unique, a.link_click_count_unique_by_step);
        const replies = num(a.reply_count);
        const meetings = num(a.total_opportunities);
        const leads = num(a.leads_count);
        const contacted = num(a.contacted_count);
        return {
          id: a.campaign_id,
          name: a.campaign_name ?? meta.name ?? "Untitled",
          status: STATUS_MAP[(a.campaign_status ?? meta.status) as number] ?? "Draft",
          sent, opens, opensUnique, clicks, clicksUnique, replies, meetings, leads, contacted,
          ctr: sent ? +((clicks / sent) * 100).toFixed(2) : 0,
          uniqueCtr: sent ? +((clicksUnique / sent) * 100).toFixed(2) : 0,
          ctor: opens ? +((clicks / opens) * 100).toFixed(2) : 0,
          clicksPerLead: leads ? +((clicksUnique / leads) * 100).toFixed(1) : 0,
          tags: (meta.email_tag_list ?? []) as string[],
        };
      })
      .filter((r) => r.sent > 0)
      .sort((a, b) => b.clicks - a.clicks);

    const totals = aggregate(analytics.filter(matchesRow));
    const prevTotals = aggregate(prevAnalytics.filter(matchesRow));

    const openRate = totals.sent ? (totals.opens / totals.sent) * 100 : 0;
    const replyRate = totals.sent ? (totals.replies / totals.sent) * 100 : 0;
    const prevOpenRate = prevTotals.sent ? (prevTotals.opens / prevTotals.sent) * 100 : 0;
    const prevReplyRate = prevTotals.sent ? (prevTotals.replies / prevTotals.sent) * 100 : 0;

    const sentChange = pctChange(totals.sent, prevTotals.sent);
    const openChange = +(openRate - prevOpenRate).toFixed(1);
    const replyChange = +(replyRate - prevReplyRate).toFixed(1);
    const meetingsChange = pctChange(totals.meetings, prevTotals.meetings);

    const kpis = [
      { label: "Emails Sent", value: totals.sent.toLocaleString(), change: sentChange, trend: (sentChange >= 0 ? "up" : "down") as "up" | "down" },
      { label: "Open Rate", value: `${openRate.toFixed(1)}%`, change: openChange, trend: (openChange >= 0 ? "up" : "down") as "up" | "down" },
      { label: "Reply Rate", value: `${replyRate.toFixed(1)}%`, change: replyChange, trend: (replyChange >= 0 ? "up" : "down") as "up" | "down" },
      { label: "Opportunities", value: totals.meetings.toLocaleString(), change: meetingsChange, trend: (meetingsChange >= 0 ? "up" : "down") as "up" | "down" },
    ];

    // Trend: prefer real daily data; otherwise distribute totals
    let trendData: { date: string; opens: number; replies: number; clicks: number }[] = [];
    if (daily.length > 0) {
      trendData = daily.map((r: any) => ({
        date: new Date(r.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        opens: num(r.opens, r.open_count, r.unique_opens),
        replies: num(r.replies, r.reply_count),
        clicks: num(r.clicks, r.link_click_count, r.unique_clicks),
      }));
    } else {
      trendData = Array.from({ length: days }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
        return {
          date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
          opens: Math.round(totals.opens / days),
          replies: Math.round(totals.replies / days),
          clicks: Math.round(totals.clicks / days),
        };
      });
    }

    // Funnel
    const sent = Math.max(1, totals.sent);
    const delivered = Math.max(0, totals.sent - totals.bounces);
    const opened = totals.opens;
    const clicked = totals.clicks;
    const replied = totals.replies;
    const meetings = totals.meetings;
    const funnelData = [
      { stage: "Sent", value: totals.sent, pct: 100 },
      { stage: "Delivered", value: delivered, pct: +((delivered / sent) * 100).toFixed(1) },
      { stage: "Opened", value: opened, pct: +((opened / sent) * 100).toFixed(1) },
      { stage: "Clicked", value: clicked, pct: +((clicked / sent) * 100).toFixed(1) },
      { stage: "Replied", value: replied, pct: +((replied / sent) * 100).toFixed(1) },
      { stage: "Meetings", value: meetings, pct: +((meetings / sent) * 100).toFixed(2) },
    ];

    // Reply by day-of-week from daily data
    let replyByDay = baseReplyByDay;
    if (daily.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: Record<string, { opens: number; replies: number }> = {};
      for (const r of daily) {
        const dt = new Date(r.date);
        const name = dayNames[dt.getDay()];
        const b = (buckets[name] ??= { opens: 0, replies: 0 });
        b.opens += num(r.opens, r.open_count, r.unique_opens);
        b.replies += num(r.replies, r.reply_count);
      }
      replyByDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        day,
        opens: buckets[day]?.opens ?? 0,
        replies: buckets[day]?.replies ?? 0,
      }));
    }

    const tagOptions: { id: string; label: string }[] = tagsQ.data ?? [];

    const campaignOptions = campaignsMeta
      .filter((c: any) => filters.tag === "all" || (c.email_tag_list ?? []).includes(filters.tag))
      .map((c: any) => ({ id: c.id, name: c.name ?? "Untitled" }));

    // Real deliverability derived from Instantly signals
    const filteredAnalytics = analytics.filter(matchesRow);

    const sentSafe = Math.max(1, totals.sent);
    const bounceRate = +((totals.bounces / sentSafe) * 100).toFixed(2);
    const blockRate = +((totals.blocks / sentSafe) * 100).toFixed(2);
    const unsubRate = +((totals.unsubs / sentSafe) * 100).toFixed(2);
    const replyRatePct = +((totals.replies / sentSafe) * 100).toFixed(2);
    const deliveredCount = Math.max(0, totals.sent - totals.bounces - totals.blocks);
    const inboxPlacement = totals.sent ? +((deliveredCount / sentSafe) * 100).toFixed(1) : 0;
    let score = 100;
    score -= Math.min(40, bounceRate * 8);
    score -= Math.min(20, blockRate * 10);
    score -= Math.min(15, unsubRate * 15);
    score -= replyRatePct < 1 && totals.sent > 100 ? 10 : 0;
    score = Math.max(0, Math.round(score));

    const domainRows = filteredAnalytics
      .map((a: any) => {
        const meta = metaMap.get(a.campaign_id) ?? {};
        const cs = num(a.emails_sent_count);
        const cb = num(a.bounced_count);
        const cbl = num(a.emails_blocked_count, a.blocked_count);
        const cu = num(a.unsubscribed_count);
        const cr = num(a.reply_count);
        const csent = Math.max(1, cs);
        const br = (cb / csent) * 100;
        const blr = (cbl / csent) * 100;
        const ur = (cu / csent) * 100;
        const placement = Math.max(0, ((cs - cb - cbl) / csent) * 100);
        let s = 100 - Math.min(40, br * 8) - Math.min(20, blr * 10) - Math.min(15, ur * 15);
        s = Math.max(0, Math.round(s));
        const status = s >= 85 ? "healthy" : s >= 65 ? "warning" : "critical";
        return {
          domain: a.campaign_name ?? meta.name ?? "Untitled",
          score: s, status, inbox: +placement.toFixed(1),
          sent: cs, bounces: cb, blocks: cbl, unsubs: cu, replies: cr,
          bounceRate: +br.toFixed(2),
        };
      })
      .filter((d) => d.sent > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8);

    const alerts: { severity: "critical" | "warning" | "info"; title: string; desc: string; time: string }[] = [];
    if (bounceRate >= 5) alerts.push({ severity: "critical", title: "Bounce rate exceeds 5%", desc: `Aggregate bounce rate is ${bounceRate}% (${totals.bounces.toLocaleString()} of ${totals.sent.toLocaleString()}). Pause sending and clean your list.`, time: "now" });
    else if (bounceRate >= 2) alerts.push({ severity: "warning", title: "Elevated bounce rate", desc: `Aggregate bounce rate is ${bounceRate}% — keep below 2% to protect sender reputation.`, time: "now" });
    if (blockRate >= 1) alerts.push({ severity: "critical", title: "Emails being blocked", desc: `${totals.blocks.toLocaleString()} sends were blocked (${blockRate}%). Review domain authentication and content.`, time: "now" });
    if (unsubRate >= 0.5) alerts.push({ severity: "warning", title: "High unsubscribe rate", desc: `${totals.unsubs.toLocaleString()} unsubscribes (${unsubRate}%). Tighten targeting and relevance.`, time: "now" });
    for (const d of domainRows.filter((x) => x.status === "critical").slice(0, 3)) {
      alerts.push({ severity: "critical", title: `${d.domain}: poor deliverability`, desc: `Bounce ${d.bounceRate}% across ${d.sent.toLocaleString()} sends. Inbox placement ${d.inbox}%.`, time: "now" });
    }
    if (totals.sent > 0 && replyRatePct < 1) alerts.push({ severity: "info", title: "Low engagement signal", desc: `Reply rate is ${replyRatePct}% — ISPs may interpret low engagement as spam-like.`, time: "now" });
    if (totals.sent === 0) alerts.push({ severity: "info", title: "No sends in window", desc: "Widen the date range or pick another campaign to evaluate deliverability.", time: "now" });
    else if (alerts.length === 0) alerts.push({ severity: "info", title: "All deliverability signals healthy", desc: "No bounce, block, or unsubscribe thresholds exceeded for the selected window.", time: "now" });

    const realDeliverability = {
      score, inbox: inboxPlacement, spam: blockRate,
      missing: Math.max(0, +(100 - inboxPlacement - blockRate).toFixed(1)),
      bounceRate, blockRate, unsubRate,
      totalBounces: totals.bounces, totalBlocks: totals.blocks, totalUnsubs: totals.unsubs,
      totalSent: totals.sent, totalReplies: totals.replies,
      domains: domainRows, alerts,
      providerDist: deliverability.providerDist,
    };

    return {
      days, kpis, trendData, funnelData,
      campaigns: campaignRows, engagementRows, replyByDay,
      deliverability: realDeliverability,
      aiInsights, campaignOptions, tagOptions, isLoading,
      error: error ? (error as Error).message : null,
    };
  }, [analyticsQ.data, prevAnalyticsQ.data, campaignsQ.data, dailyQ.data, tagsQ.data, filters, win, isLoading, error]);

  return data;
}

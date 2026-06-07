export const kpis = [
  { label: "Emails Sent", value: "248,931", change: 12.4, trend: "up" as const },
  { label: "Open Rate", value: "42.8%", change: 3.2, trend: "up" as const },
  { label: "Reply Rate", value: "8.6%", change: -0.7, trend: "down" as const },
  { label: "Opportunities", value: "1,284", change: 18.9, trend: "up" as const },
];

export const trendData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
    opens: Math.round(2000 + Math.sin(i / 4) * 600 + Math.random() * 400),
    replies: Math.round(400 + Math.cos(i / 5) * 120 + Math.random() * 80),
    clicks: Math.round(900 + Math.sin(i / 3) * 200 + Math.random() * 150),
  };
});

export const funnelData = [
  { stage: "Sent", value: 248931, pct: 100 },
  { stage: "Delivered", value: 241452, pct: 97.0 },
  { stage: "Opened", value: 103341, pct: 42.8 },
  { stage: "Clicked", value: 28412, pct: 11.4 },
  { stage: "Replied", value: 21408, pct: 8.6 },
  { stage: "Meetings", value: 1284, pct: 0.5 },
];

export const campaigns = [
  { name: "Q2 Enterprise Outbound", status: "Active", sent: 42819, openRate: 48.2, replyRate: 11.4, meetings: 312, owner: "Sarah Chen" },
  { name: "SaaS Founders Nurture", status: "Active", sent: 28341, openRate: 51.7, replyRate: 9.8, meetings: 184, owner: "Marcus Lee" },
  { name: "RevOps Re-engagement", status: "Paused", sent: 18203, openRate: 38.4, replyRate: 5.2, meetings: 47, owner: "Priya Shah" },
  { name: "Product-Led Trial", status: "Active", sent: 35492, openRate: 44.1, replyRate: 10.2, meetings: 241, owner: "Diego Rivera" },
  { name: "ABM Tier-1 Accounts", status: "Active", sent: 8410, openRate: 62.3, replyRate: 17.6, meetings: 96, owner: "Sarah Chen" },
  { name: "Webinar Follow-up", status: "Completed", sent: 22104, openRate: 56.8, replyRate: 12.1, meetings: 178, owner: "Marcus Lee" },
  { name: "Cold List — Fintech", status: "Active", sent: 19842, openRate: 31.5, replyRate: 4.7, meetings: 52, owner: "Priya Shah" },
  { name: "Renewal Push EMEA", status: "Draft", sent: 0, openRate: 0, replyRate: 0, meetings: 0, owner: "Diego Rivera" },
];

export const deliverability = {
  score: 92,
  inbox: 94.2,
  spam: 3.1,
  missing: 2.7,
  bounceRate: 1.8,
  domains: [
    { domain: "send.acme.com", score: 96, status: "healthy", inbox: 96.4, spf: true, dkim: true, dmarc: true },
    { domain: "mail.acme.io", score: 88, status: "warning", inbox: 89.1, spf: true, dkim: true, dmarc: false },
    { domain: "go.acme.co", score: 72, status: "critical", inbox: 74.8, spf: true, dkim: false, dmarc: false },
    { domain: "hello.acme.com", score: 94, status: "healthy", inbox: 95.2, spf: true, dkim: true, dmarc: true },
  ],
  alerts: [
    { severity: "critical", title: "DKIM failing on go.acme.co", desc: "47% of emails from this domain are missing DKIM signatures. Configure DKIM records.", time: "2h ago" },
    { severity: "warning", title: "Spam rate above threshold", desc: "Spam complaints on mail.acme.io rose to 0.42% (target <0.3%).", time: "6h ago" },
    { severity: "info", title: "Gmail throttling detected", desc: "Send rate to gmail.com auto-throttled for 30 minutes to protect reputation.", time: "1d ago" },
  ],
  providerDist: [
    { provider: "Gmail", value: 42 },
    { provider: "Outlook", value: 31 },
    { provider: "Yahoo", value: 12 },
    { provider: "Apple", value: 9 },
    { provider: "Other", value: 6 },
  ],
};

export const aiInsights = [
  {
    impact: "high" as const,
    category: "Subject Lines",
    title: "Shorter subject lines outperform by 34%",
    desc: "Subjects under 40 characters have a 51% open rate vs 38% for longer ones across your last 12 campaigns. Consider tightening 8 active sequences.",
    action: "Apply to active campaigns",
  },
  {
    impact: "high" as const,
    category: "Send Time",
    title: "Tuesday 10:00 AM local is your peak window",
    desc: "Replies are 2.1× higher when sent Tue 9–11 AM in the recipient timezone. Shift 'Cold List — Fintech' from Mon 7 AM to capture +120 replies/week.",
    action: "Reschedule sends",
  },
  {
    impact: "medium" as const,
    category: "Segmentation",
    title: "Director-level titles convert 3× better than VP+",
    desc: "Directors at 200–1000 employee companies reply 17% vs 5.4% for VPs at the same size. Re-target the ABM tier-1 list.",
    action: "View segment",
  },
  {
    impact: "medium" as const,
    category: "Copy",
    title: "Personalized first line lifts replies 22%",
    desc: "Emails opening with a personalized hook outperform templated openers. 4 sequences are still using a generic opener.",
    action: "Review sequences",
  },
  {
    impact: "low" as const,
    category: "Deliverability",
    title: "Warm a second sending domain",
    desc: "You're approaching 80% capacity on send.acme.com. Begin warming a backup domain to maintain reputation.",
    action: "Start warmup",
  },
  {
    impact: "low" as const,
    category: "Follow-ups",
    title: "Add a 4th touch to nurture sequences",
    desc: "Adding a fourth follow-up after 9 days historically recovers ~14% of non-responders without lifting unsubscribes.",
    action: "Edit sequences",
  },
];

export const replyByDay = [
  { day: "Mon", replies: 312, opens: 1820 },
  { day: "Tue", replies: 498, opens: 2410 },
  { day: "Wed", replies: 421, opens: 2180 },
  { day: "Thu", replies: 386, opens: 2050 },
  { day: "Fri", replies: 241, opens: 1480 },
  { day: "Sat", replies: 84, opens: 520 },
  { day: "Sun", replies: 62, opens: 410 },
];

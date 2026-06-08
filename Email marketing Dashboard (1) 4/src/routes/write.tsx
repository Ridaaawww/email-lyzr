import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchSkillContent } from "@/lib/claude.functions";
import {
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Terminal,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Sparkles,
  X,
} from "lucide-react";

export const Route = createFileRoute("/write")({
  component: SkillsPage,
});

// ─── Skills Library data ───────────────────────────────────────────────────────

type SkillSource = "hubspot" | "community";

interface Skill {
  id: string;
  name: string;
  creator: string;
  source: SkillSource;
  description: string;
  tags: string[];
  repoUrl?: string;
  downloadUrl?: string;
  rawUrl?: string;
  installCmd?: string;
  highlights: string[];
}

const SKILLS: Skill[] = [
  {
    id: "hubspot-messaging",
    name: "Messaging & Positioning Architect",
    creator: "HubSpot",
    source: "hubspot",
    description:
      "Stop agonizing over messaging. Drop your product info in, walk out with a positioning framework your whole team can actually use. This is what HubSpot's own GTM team runs on — and now it's yours.",
    tags: ["positioning", "gtm", "messaging"],
    downloadUrl: "https://offers.hubspot.com/messaging-and-positioning-architect",
    highlights: [
      "Literally what HubSpot's own GTM team runs on — no fluff",
      "Get aligned on messaging in one session instead of six meetings",
      "Positioning, value props, competitive edge — all in one doc",
    ],
  },
  {
    id: "hubspot-icp",
    name: "ICP Builder",
    creator: "HubSpot",
    source: "hubspot",
    description:
      "Who is your customer, actually? This settles that argument in 15 minutes flat. Built on HubSpot's original ICP methodology — the one they used to scale to millions of customers.",
    tags: ["research", "icp", "strategy", "sales"],
    downloadUrl: "https://offers.hubspot.com/icp-builder-skill",
    highlights: [
      "15 minutes to a complete, real ICP doc",
      "No more 'our customer is basically anyone who...' energy",
      "Firmographics, psychographics, trigger events — all covered",
    ],
  },
  {
    id: "hubspot-campaign",
    name: "Campaign Deck Builder",
    creator: "HubSpot",
    source: "hubspot",
    description:
      "Brief in. Executive deck out. Your boss will think you pulled an all-nighter. You didn't — you just had the right playbook and Claude doing the heavy lifting.",
    tags: ["campaigns", "presentations", "strategy"],
    downloadUrl: "https://offers.hubspot.com/campaign-deck-builder-skill",
    highlights: [
      "Executive-ready in one session, no all-nighter required",
      "Narrative-first — it actually tells a story, not just bullet points",
      "Goals, audience, channels, KPIs, budget — nothing left out",
    ],
  },
  {
    id: "hubspot-linkedin",
    name: "LinkedIn Post Generator",
    creator: "HubSpot",
    source: "hubspot",
    description:
      "Somebody analyzed 50 viral LinkedIn posts to reverse-engineer exactly what made them blow up. That knowledge is now a skill file. You're very welcome.",
    tags: ["linkedin", "content", "social"],
    downloadUrl: "https://offers.hubspot.com/linkedin-post-generator-skill",
    highlights: [
      "Built by dissecting 50 actual viral posts — not guessing",
      "Hooks, structure, and CTA patterns that get real engagement",
      "Storytelling, lists, hot takes — every format that works",
    ],
  },
  {
    id: "hubspot-prompts",
    name: "Claude Connector Prompt Library",
    creator: "HubSpot",
    source: "hubspot",
    description:
      "60+ prompts for the moment you connect HubSpot to Claude and suddenly don't know what to ask first. These are the right questions — fully written, ready to run. No blank-page panic.",
    tags: ["crm", "prompts", "automation"],
    downloadUrl: "https://offers.hubspot.com/claude-connector-prompt-library",
    highlights: [
      "60+ prompts, zero blank-page anxiety",
      "Works with the HubSpot Connector for Claude (Pro/Max/Team/Enterprise)",
      "Sales, marketing, service, ops — every team's covered",
    ],
  },
  {
    id: "cold-email",
    name: "Cold Email",
    creator: "Corey Haines",
    source: "community",
    description:
      "Corey Haines' entire cold email philosophy in one file: if a sentence doesn't move the reader toward replying, it's gone. Zero tolerance for filler. Built for people who want replies, not vanity opens.",
    tags: ["cold-email", "b2b", "sequences", "follow-up"],
    repoUrl: "https://github.com/coreyhaines31/marketingskills",
    rawUrl:
      "https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/cold-email/SKILL.md",
    installCmd:
      "git clone https://github.com/coreyhaines31/marketingskills.git\ncp -r marketingskills/skills/cold-email ~/.claude/skills/",
    highlights: [
      "Zero filler words. Zero fluff. Every sentence earns its place.",
      "Cold opens, follow-ups, and the dreaded break-up email",
      "Written to get replies — not to win subject line awards",
    ],
  },
  {
    id: "email-sequence",
    name: "Email Sequence",
    creator: "Corey Haines",
    source: "community",
    description:
      "The welcome email. The nurture sequence. The win-back campaign. All the emails for people who already gave you a chance — showing up at exactly the right moment with exactly the right thing to say.",
    tags: ["sequences", "nurture", "lifecycle", "onboarding"],
    repoUrl: "https://github.com/coreyhaines31/marketingskills",
    rawUrl:
      "https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/email-sequence/SKILL.md",
    installCmd:
      "git clone https://github.com/coreyhaines31/marketingskills.git\ncp -r marketingskills/skills/email-sequence ~/.claude/skills/",
    highlights: [
      "Onboarding, nurture, win-back — the whole lifecycle mapped",
      "Warm audience rules: completely different game from cold outreach",
      "Timing logic built in — not just templates to fill in",
    ],
  },
  {
    id: "copywriting",
    name: "Copywriting",
    creator: "Corey Haines",
    source: "community",
    description:
      "PAS. AIDA. Before/After/Bridge. The frameworks that made legendary copywriters famous — now running through Claude at your command. Every format, every channel, all in one file.",
    tags: ["copywriting", "conversion", "cro", "landing-pages"],
    repoUrl: "https://github.com/coreyhaines31/marketingskills",
    rawUrl:
      "https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/copywriting/SKILL.md",
    installCmd:
      "git clone https://github.com/coreyhaines31/marketingskills.git\ncp -r marketingskills/skills/copywriting ~/.claude/skills/",
    highlights: [
      "The classics that still work: PAS, AIDA, BAB — all in here",
      "Email, landing pages, ads, subject lines — all formats covered",
      "Written to make people act, not just nod along",
    ],
  },
  {
    id: "email-marketing-bible",
    name: "Email Marketing Bible",
    creator: "George Hartley (SmartrMail)",
    source: "community",
    description:
      "68,000 words. 908 sources. 19 industry playbooks. 57 email design examples. George Hartley put a career's worth of email knowledge into one file. Drop it in Claude and you basically hired a seasoned CMO.",
    tags: ["email", "strategy", "deliverability", "automation", "ecommerce"],
    repoUrl: "https://github.com/CosmoBlk/email-marketing-bible",
    rawUrl:
      "https://raw.githubusercontent.com/CosmoBlk/email-marketing-bible/main/SKILL.md",
    installCmd:
      "git clone https://github.com/CosmoBlk/email-marketing-bible.git ~/.claude/skills/email-marketing-bible",
    highlights: [
      "The most comprehensive email marketing skill on the internet — full stop",
      "19 industry playbooks — chances are yours is in here",
      "Welcome, abandoned cart, post-purchase, win-back — all ready to run",
    ],
  },
  {
    id: "email-marketing-tech",
    name: "Email Marketing (Technical)",
    creator: "Jacques Corby-Tuech",
    source: "community",
    description:
      "SPF. DKIM. DMARC. ESP selection. The technical stuff you know matters but kept putting off. Jacques Corby-Tuech put it all in one skill so you never have to Google 'why are my emails going to spam' again.",
    tags: ["email", "deliverability", "technical", "authentication"],
    repoUrl: "https://github.com/jacquescorbytuech/email-marketing-skill",
    rawUrl:
      "https://raw.githubusercontent.com/jacquescorbytuech/email-marketing-skill/main/SKILL.md",
    installCmd:
      "git clone https://github.com/jacquescorbytuech/email-marketing-skill.git ~/.claude/skills/email-marketing-skill",
    highlights: [
      "SPF, DKIM, DMARC — no more Googling why you're landing in spam",
      "ESP selection framework so you stop second-guessing your tech stack",
      "Strategy, segmentation, automation, list hygiene — all in one place",
    ],
  },
];

const SOURCE_COLORS: Record<SkillSource, string> = {
  hubspot: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  community: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

const ALL_TAGS = [
  "All",
  "hubspot",
  "cold-email",
  "sequences",
  "copywriting",
  "research",
  "deliverability",
  "strategy",
];

// ─── HubSpot Prompts data ──────────────────────────────────────────────────────

type HubSpotCategory = "Sales" | "Marketing" | "Service" | "Customer Success" | "Commerce" | "RevOps";

interface HubSpotPrompt {
  id: string;
  category: HubSpotCategory;
  useCase: string;
  title: string;
  prompt: string;
}

const CATEGORY_COLORS: Record<HubSpotCategory, string> = {
  Sales: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Marketing: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Service: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Customer Success": "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  Commerce: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  RevOps: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const CATEGORY_BG: Record<HubSpotCategory, string> = {
  Sales: "bg-blue-100/40 dark:bg-blue-950/20",
  Marketing: "bg-purple-100/40 dark:bg-purple-950/20",
  Service: "bg-green-100/40 dark:bg-green-950/20",
  "Customer Success": "bg-teal-100/40 dark:bg-teal-950/20",
  Commerce: "bg-orange-100/40 dark:bg-orange-950/20",
  RevOps: "bg-rose-100/40 dark:bg-rose-950/20",
};

const HUBSPOT_PROMPTS: HubSpotPrompt[] = [
  // Sales
  {
    id: "s1", category: "Sales", useCase: "Deal Prioritization",
    title: "Deal Prioritization Analysis",
    prompt: "Analyze open HubSpot deals created during last 3 months with amounts over $10,000 that are not in closed-won or closed-lost stages. For each deal show: deal name, amount, current stage, days since last activity, and assigned owner. Sort by deal amount descending and identify which deals need immediate attention.",
  },
  {
    id: "s2", category: "Sales", useCase: "Lead Generation",
    title: "Sales-Ready Contact Identification",
    prompt: "Find HubSpot contacts with lifecycle stages indicating sales readiness (not subscribers or customers), who have predictive contact scores above 0.5. Show their company, title, last activity date, and email engagement history. Group by company to identify accounts with multiple engaged contacts.",
  },
  {
    id: "s3", category: "Sales", useCase: "Deal Prioritization",
    title: "Stalled Deal Recovery",
    prompt: "Identify HubSpot companies where the last sales activity occurred more than 30 days ago, but they have open deals. For each company show the deal name, amount, stage, and last activity date. Draft a brief re-engagement note for the top 5 highest-value stalled deals.",
  },
  {
    id: "s4", category: "Sales", useCase: "Optimize Sales Performance",
    title: "Sales Velocity Analysis",
    prompt: "Analyze closed-won HubSpot deals from last 3 months showing days to close, amounts, deal types, and associated company industries. Identify the deal characteristics (size range, industry, source) that correlate with fastest close times and highest win rates.",
  },
  {
    id: "s5", category: "Sales", useCase: "Optimize Sales Performance",
    title: "Customer Journey Mapping",
    prompt: "Show the complete customer journey from first visit to closed deal in HubSpot for won deals during the last 6 months. Include: first touch source, number of touchpoints, content engaged with, time in each lifecycle stage, and sales activities logged. Identify the most common winning journeys.",
  },
  {
    id: "s6", category: "Sales", useCase: "Prospecting",
    title: "Follow-Up Email Drafting",
    prompt: "Draft a follow-up email for [PERSON] about [TOPIC] from a meeting on [DATE]. Use a [TONE] tone. Include: a brief recap of what was discussed, any commitments made, clear next steps with owners and dates, and a specific ask for the next meeting or decision. Keep it under 150 words.",
  },
  {
    id: "s7", category: "Sales", useCase: "Prospecting",
    title: "Meeting Preparation Brief",
    prompt: "Prepare a meeting brief for [TOPIC] with [STAKEHOLDERS]. Pull their HubSpot contact history, recent activities, and any open deals or tickets. Include: key context about their situation, open items from previous conversations, 3–5 strategic questions to ask, and the ideal outcome for this meeting.",
  },
  {
    id: "s8", category: "Sales", useCase: "Sales Enablement",
    title: "Stakeholder Influence Map",
    prompt: "Based on these meeting notes [PASTE NOTES], create a stakeholder influence map identifying: each stakeholder's role and priorities, their decision-making authority level, relationships and potential blockers between stakeholders, and recommended engagement strategy for each person to accelerate the deal.",
  },
  {
    id: "s9", category: "Sales", useCase: "Prospecting",
    title: "Strategic Account Plan",
    prompt: "Create a strategic account plan for [COMPANY/PROSPECT]. Include: their current pain points and business objectives, AI transformation opportunities relevant to their industry, potential objections and how to address them, competitive context, and a contrarian messaging angle that differentiates us from what they've already heard.",
  },
  {
    id: "s10", category: "Sales", useCase: "Deal Prioritization",
    title: "7-Day Deal Closure Push",
    prompt: "Find all open deals with close dates in the next 7 days. For each deal, show the deal name, amount, stage, owner, and last activity. Create a high-priority task for each deal owner to confirm next steps and update the close date if needed. Flag any deals over $5,000 that have had no activity in the last 5 days.",
  },
  {
    id: "s11", category: "Sales", useCase: "Optimize Sales Performance",
    title: "Top Deals with Line Items",
    prompt: "Show me the top 10 deals with the highest amount currently in the 'Qualified to Buy' stage. For each deal include the associated company, owner, and last activity. For the deal called [DEAL NAME], add the following line items [LIST ITEMS WITH PRICES] and calculate the updated deal total.",
  },
  {
    id: "s12", category: "Sales", useCase: "Optimize Sales Performance",
    title: "Data Quality Task Creation",
    prompt: "Show me all open deals from last month that are missing close dates or deal amounts. Group them by owner. Create a task for each deal owner with the subject 'Update deal information' and due date of tomorrow, listing the specific deals they need to fix.",
  },
  {
    id: "s13", category: "Sales", useCase: "Industry Selling",
    title: "Segment-Based Sales Coaching",
    prompt: "For the [SEGMENT NAME] segment in HubSpot, help me prepare for a sales call:\n1. Suggest a call opening that builds rapport with this segment's typical buyer persona\n2. List 5 high-value talking points based on this segment's industry trends\n3. What pricing or product package resonates best with this segment?\n4. Which competitors does this segment compare us to most, and how do we win against them?\n5. What's the typical deal cycle length and what causes delays?",
  },
  {
    id: "s14", category: "Sales", useCase: "Quote Performance",
    title: "Quote Analysis by Product",
    prompt: "Analyze all quotes from the last 6 months including line item details, discount rates applied, and final quote values. Identify: which products appear most in accepted vs. rejected quotes, average discount by product, and which rep is closing at the highest quote value. Flag quotes with discounts over 20%.",
  },
  // Marketing
  {
    id: "m1", category: "Marketing", useCase: "Lead Nurture",
    title: "Early-Stage Lead Engagement",
    prompt: "Find HubSpot contacts in early lifecycle stages (subscribers, leads) who opened at least one email this year but have shown no progression in lifecycle stage. Show their first conversion source, content they've engaged with, and days since last activity. Suggest a re-engagement sequence for the top 20 most recently active.",
  },
  {
    id: "m2", category: "Marketing", useCase: "Performance & Analytics",
    title: "Revenue Attribution Analysis",
    prompt: "Analyze HubSpot contacts created this month and their associated deals. Show original traffic source, first-touch and last-touch campaigns, and the revenue attributed to each source. Break down by channel (organic, paid, email, referral) and identify which campaigns are producing the highest-value pipeline.",
  },
  {
    id: "m3", category: "Marketing", useCase: "Targeting & Segmentation",
    title: "Account-Based Marketing Targets",
    prompt: "Identify target companies in HubSpot with 3 or more contacts showing active engagement in the last 90 days (email opens, page views, or content downloads). For each company show: company size, industry, number of engaged contacts, their titles, and any open deals. Rank by overall engagement score.",
  },
  {
    id: "m4", category: "Marketing", useCase: "Targeting & Segmentation",
    title: "Firmographic Segmentation",
    prompt: "Analyze my HubSpot contacts by firmographic data (industry, company size, region), behavioral patterns (email open rates, click rates, last engagement date), and demographic information (job title, seniority). Create 4–5 distinct segments with clear characteristics and recommended messaging angles for each.",
  },
  {
    id: "m5", category: "Marketing", useCase: "Funnel Optimization",
    title: "Marketing Funnel Analysis",
    prompt: "Track HubSpot contacts created last quarter through each lifecycle stage — showing average time spent in each stage, drop-off rates between stages, and which stages have the biggest conversion gaps. Identify the top 3 bottlenecks in the funnel and suggest specific actions to improve each.",
  },
  {
    id: "m6", category: "Marketing", useCase: "Productivity",
    title: "My Contact Review",
    prompt: "Find all HubSpot contacts assigned to me that were created or became active this year. Show number of sales activities logged, last contacted date, lifecycle stage, and any open deals. Highlight contacts I haven't touched in over 30 days who are in active pipeline stages.",
  },
  {
    id: "m7", category: "Marketing", useCase: "Lead Nurture",
    title: "Multi-Channel Campaign Plan",
    prompt: "Create a coordinated 4-week campaign for [CAMPAIGN OBJECTIVE] across: LinkedIn (3 posts/week), Email (2 per week), Blog (1 post/week), and Webinar (1 event). For each channel include: weekly themes, content format, call-to-action, and how each piece connects to the others to create a coherent narrative arc.",
  },
  {
    id: "m8", category: "Marketing", useCase: "Performance & Analytics",
    title: "Competitive Intelligence Brief",
    prompt: "Review [COMPETITORS] in the [INDUSTRY] space. For each competitor identify: their current AI positioning and messaging, gaps or weaknesses in their approach, how our solution addresses those gaps, and one contrarian angle we can use to reframe the conversation away from their strengths.",
  },
  {
    id: "m9", category: "Marketing", useCase: "Targeting & Segmentation",
    title: "Market Positioning Reframe",
    prompt: "Help me reframe our market position to be more distinct and harder to copy. Based on our current positioning [PASTE CURRENT MESSAGING], create three alternative positioning statements that: challenge a conventional assumption in our market, lead with an outcome rather than a feature, and are specific enough that a competitor can't use the exact same language.",
  },
  {
    id: "m10", category: "Marketing", useCase: "Performance & Analytics",
    title: "Content Performance Dashboard",
    prompt: "I've uploaded our content performance data [ATTACH DATA]. Create an interactive analysis showing: top 10 performing pieces by engagement rate, traffic source breakdown per content type, which topics generate the most pipeline, content gap analysis by buyer stage, and 3 recommendations for next quarter's content calendar.",
  },
  {
    id: "m11", category: "Marketing", useCase: "Segment effectiveness",
    title: "Segment Engagement Patterns",
    prompt: "Identify patterns in how the [SEGMENT NAME] segment engages with content compared to our other high-value segments. Show: preferred content formats, topics with highest engagement, email send times with best open rates, and what content piece most commonly precedes a lifecycle stage progression for this segment.",
  },
  {
    id: "m12", category: "Marketing", useCase: "Segment effectiveness",
    title: "Acquisition Channel Attribution",
    prompt: "Which acquisition channels have historically brought in the [SEGMENT NAME] segment? Break down by channel, show average time-to-conversion, deal value by source, and CAC estimate per channel. Use this to recommend where to increase or decrease budget allocation for this segment over the next quarter.",
  },
  {
    id: "m13", category: "Marketing", useCase: "Segment effectiveness",
    title: "Segment Lifetime Value Analysis",
    prompt: "Calculate the lifetime value of the [SEGMENT NAME] segment over the past 6 months. Show: average deal size, churn rate, expansion revenue, and LTV trend. Compare against our other top segments and identify whether this segment is growing, stable, or declining — with reasons and recommended actions.",
  },
  // Service
  {
    id: "sv1", category: "Service", useCase: "Customer Support",
    title: "High-Priority Company Tickets",
    prompt: "Find HubSpot companies that have opened high-priority or urgent tickets in the last 60 days. For each company show: number of tickets, ticket subjects, average resolution time, their total deal value, and assigned owner. Flag any companies with 3+ unresolved tickets that also have open renewal deals.",
  },
  {
    id: "sv2", category: "Service", useCase: "Performance & Analytics",
    title: "Ticket Response Time Analysis",
    prompt: "Analyze HubSpot tickets created this quarter. Show: average time-to-first-response by owner and by priority level, average time-to-close, SLA breach rate, and tickets with no response after 24 hours. Identify the top 3 owners who are consistently meeting SLAs and the 3 most common causes of SLA breaches.",
  },
  {
    id: "sv3", category: "Service", useCase: "Performance & Analytics",
    title: "Quarterly Ticket Metrics",
    prompt: "Examine all HubSpot tickets created this quarter. Analyze: volume by creation source (email, chat, form, phone), priority distribution, average resolution time by category, and re-open rate. Compare to last quarter and highlight any metrics that have worsened by more than 10%.",
  },
  {
    id: "sv4", category: "Service", useCase: "Customer Retention",
    title: "Recurring Issue Identification",
    prompt: "Identify companies in HubSpot that opened 3 or more tickets in the last quarter on similar topics. Group tickets by recurring themes and show affected companies, their contract value, and how long the issue has been recurring. This signals systemic problems — suggest product or process fixes for the top 3 recurring issues.",
  },
  {
    id: "sv5", category: "Service", useCase: "Productivity",
    title: "My Open Ticket Queue",
    prompt: "Show all open HubSpot tickets currently assigned to me. Sort by oldest creation date first. For each ticket show: ticket ID, subject, company, priority, days open, and last note. Flag any tickets that have been open more than 7 days without an update and suggest a response approach for each.",
  },
  {
    id: "sv6", category: "Service", useCase: "Customer Support",
    title: "Top Customer Problems This Year",
    prompt: "Analyze all HubSpot tickets created this year. Identify the top 10 most common problems customers are reporting — group by category, show volume trend month-over-month, average resolution difficulty, and which customer segments are most affected. Recommend which issues should be escalated to product.",
  },
  {
    id: "sv7", category: "Service", useCase: "Productivity",
    title: "Post-Meeting Ticket Creation",
    prompt: "I just had a customer call where they reported two issues: [ISSUE 1] and [ISSUE 2]. Create two tickets in HubSpot: one high-priority ticket for [ISSUE 1] assigned to the technical team with a 48-hour SLA, and one medium-priority ticket for [ISSUE 2] assigned to the product team as a feature request. Add me as a watcher on both.",
  },
  {
    id: "sv8", category: "Service", useCase: "Customer Support",
    title: "Overdue Ticket Sweep",
    prompt: "Show me all HubSpot tickets that have been open for more than 14 days, grouped by owner. For each overdue ticket show the subject, customer, original priority, and days open. Create a follow-up task for each ticket owner due today, with a note that escalation happens in 48 hours if unresolved.",
  },
  {
    id: "sv9", category: "Service", useCase: "Customer Support",
    title: "VIP Customer Escalation",
    prompt: "Find all open tickets from companies that have deals or contracts worth more than $50,000. For each ticket show the company name, deal value, ticket subject, priority, and days open. Create an escalation task for my personal review on any of these tickets that have been open more than 5 days without resolution.",
  },
  // Customer Success
  {
    id: "cs1", category: "Customer Success", useCase: "Customer Retention",
    title: "New Customer Onboarding Tasks",
    prompt: "Show me all HubSpot contacts who became customers in the last 14 days. For each new customer, create an onboarding task assigned to their owner with due date 3 days from today. The task should include: schedule kickoff call, send welcome resources, and confirm their primary success metric for the first 90 days.",
  },
  {
    id: "cs2", category: "Customer Success", useCase: "Customer Retention",
    title: "Inactive Customer Check-Ins",
    prompt: "Find all HubSpot contacts in the 'Customer' lifecycle stage who haven't had a meeting, call, or email logged in the last 30 days. Sort by contract value descending. Create a 'schedule check-in call' task for each customer's owner due this week, with a note highlighting their tenure and last known status.",
  },
  {
    id: "cs3", category: "Customer Success", useCase: "Customer Retention",
    title: "Expansion Opportunity Creation",
    prompt: "Show me customers who have had 3 or more calls or meetings logged in the last 30 days — high engagement often signals expansion readiness. For each one, create a new 'Expansion' deal in HubSpot at the Explore stage, linked to their existing account, and assign it to their current owner with a 30-day close date.",
  },
  {
    id: "cs4", category: "Customer Success", useCase: "Customer Retention",
    title: "Payment Pattern Analysis",
    prompt: "Analyze customer payment patterns from invoice data in HubSpot. Identify: accounts that consistently pay more than 15 days late, customers who have partially paid invoices, billing frequency preferences by segment, and any accounts with increasing invoice amounts (expansion signal). Flag accounts needing a financial health conversation.",
  },
  // Commerce
  {
    id: "co1", category: "Commerce", useCase: "Invoice Analysis",
    title: "Late Payment Identification",
    prompt: "Identify all HubSpot customers who have paid invoices more than 15 days late at least twice in the past 6 months. Show the company name, total late payment amount, average days late, and their current open invoice balance. Flag any late-payer who also has an active renewal deal in the pipeline.",
  },
  {
    id: "co2", category: "Commerce", useCase: "Invoice Analysis",
    title: "Overdue Invoice Report",
    prompt: "List all HubSpot invoices currently overdue by more than 30 days. Group by company and show: invoice number, amount, days overdue, last payment date, and invoice owner. Calculate total outstanding receivables and identify which 5 companies account for the most overdue balance.",
  },
  {
    id: "co3", category: "Commerce", useCase: "Subscription Intelligence",
    title: "Subscription Churn Risk Assessment",
    prompt: "Summarize subscription churn risks for next quarter. Show subscriptions with: end dates in the next 60 days, declining usage or engagement signals, contacts who haven't logged in recently, or accounts with recent support tickets. Rank by ARR at risk and suggest a specific retention action for each high-risk account.",
  },
  {
    id: "co4", category: "Commerce", useCase: "Invoice Analysis",
    title: "Outstanding Receivables by Customer",
    prompt: "Provide a summary of all outstanding receivable invoices in HubSpot, grouped by customer. Show each customer's total outstanding balance, oldest open invoice, number of open invoices, and their payment history score. Sort by total outstanding amount and identify the top 10 accounts to prioritize for collection.",
  },
  {
    id: "co5", category: "Commerce", useCase: "Quote Performance",
    title: "Expiring Quotes This Week",
    prompt: "Show me all HubSpot quotes expiring within the next 7 days that are still in 'Sent' or 'Viewed' status. For each quote show: quote number, company, amount, expiry date, last view date, and owner. Create a follow-up task for each owner to contact the prospect today with a decision ask.",
  },
  {
    id: "co6", category: "Commerce", useCase: "Quote Performance",
    title: "Unviewed Quotes This Quarter",
    prompt: "List all HubSpot quotes sent this quarter that have not been viewed by the prospect. Show the company name, quote amount, date sent, and deal stage. For each unviewed quote over $5,000, create a task for the owner to follow up via phone — quotes that aren't viewed rarely close.",
  },
  {
    id: "co7", category: "Commerce", useCase: "Order Insights",
    title: "Cancelled Order Review",
    prompt: "List all orders cancelled in the last 30 days in HubSpot. For each cancelled order show: company, order value, cancellation date, product items, and the reason if logged. Group by cancellation reason and identify whether any pattern points to a product, pricing, or process issue that needs addressing.",
  },
  {
    id: "co8", category: "Commerce", useCase: "Order Insights",
    title: "Shipping Delay Analysis",
    prompt: "List all HubSpot orders that took more than 30 days to move from 'Processed' to 'Shipped' status. Show: order date, ship date, delay in days, company, order value, and product type. Identify if delays cluster around specific products, regions, or time periods — and flag any delayed orders that coincide with a customer support ticket.",
  },
  {
    id: "co9", category: "Commerce", useCase: "Order Insights",
    title: "Quarterly Order Value by Customer",
    prompt: "Summarize total order value grouped by customer for this quarter in HubSpot. Show each customer's: total order count, total value, average order value, most ordered product category, and quarter-over-quarter change. Identify customers whose order value has dropped more than 20% vs. last quarter.",
  },
  {
    id: "co10", category: "Commerce", useCase: "Order Insights",
    title: "Regional Order Performance",
    prompt: "Summarize total order value and average order value grouped by region this quarter in HubSpot. Compare to last quarter and identify regions with declining order volume. For the top-performing region, show which products and customer types are driving growth — so we can replicate that playbook elsewhere.",
  },
  {
    id: "co11", category: "Commerce", useCase: "Customer Retention",
    title: "Loyal Customer Identification",
    prompt: "Identify HubSpot customers who have placed more than 5 orders in the past 6 months. For each loyal customer show: total order count, total spend, average order frequency, most purchased products, and last order date. These are candidates for a loyalty program, early access offer, or case study request.",
  },
  {
    id: "co12", category: "Commerce", useCase: "Cart insights",
    title: "Cart Abandonment Analysis",
    prompt: "Identify HubSpot contacts who added items to a cart in the last 30 days but never completed checkout. Show: contact name, company, cart value, products in cart, days since abandonment, and their lifecycle stage. Group by cart value and create a re-engagement task for the owner on any abandoned carts over $500.",
  },
  {
    id: "co13", category: "Commerce", useCase: "Product Performance",
    title: "Top Abandoned Cart Products",
    prompt: "Summarize which products are most frequently left in abandoned carts this month in HubSpot. Show product name, abandonment count, total cart value abandoned, and abandonment rate vs. total cart additions. Identify whether pricing, lack of urgency, or a competitor offer is the likely cause for the top 3 abandoned products.",
  },
  {
    id: "co14", category: "Commerce", useCase: "Product Performance",
    title: "Product Mix in Won vs. Lost Deals",
    prompt: "Analyze which specific products (from deal line items) are most commonly included in won vs. lost deals over the last 6 months. For each product show: win rate when included, average deal size, most common deal stage at loss, and which product combinations have the highest win rates. Use this to optimize product bundling strategy.",
  },
  // RevOps
  {
    id: "r1", category: "RevOps", useCase: "Optimize Sales Performance",
    title: "Pipeline Data Quality Review",
    prompt: "Show me all open deals in HubSpot and flag data quality issues: deals missing close dates, deals with amounts under $100 (likely test records), deals with no associated contact, deals that haven't moved stages in over 45 days, and deals where the close date is in the past. Group by owner and create a data cleanup task for each.",
  },
  {
    id: "r2", category: "RevOps", useCase: "Optimize Sales Performance",
    title: "Sales Velocity Benchmarking",
    prompt: "Find all deals that moved to Closed Won in the last 30 days. For each deal show: time from creation to close, deal source, stage progression timeline, number of activities logged, deal size, and owner. Calculate average sales velocity by owner and by deal source — identify what separates the fastest-closing deals from the slowest.",
  },
  {
    id: "r3", category: "RevOps", useCase: "Productivity",
    title: "Deal Ownership Transfer",
    prompt: "Find all open deals currently owned by [PERSON NAME] in HubSpot. Update the owner to [NEW PERSON NAME] for all of them. Create an introduction task for the new owner on each deal, noting the previous owner and asking them to review the deal history and schedule a handoff call within 3 business days.",
  },
  {
    id: "r4", category: "RevOps", useCase: "Optimize Sales Performance",
    title: "Owner Activity & Pipeline Assessment",
    prompt: "Show the percentage of open deals allocated to each owner, along with their recent activity metrics: calls logged, emails sent, meetings booked in the last 30 days, and average days since last activity on their deals. Identify owners who have high deal counts but low activity — they may need support or their pipeline may need cleaning.",
  },
];

const HUBSPOT_CATEGORIES: HubSpotCategory[] = [
  "Sales", "Marketing", "Service", "Customer Success", "Commerce", "RevOps",
];

// ─── Skills Library components ─────────────────────────────────────────────────

function SkillCard({ skill, selected, onClick }: { skill: Skill; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-muted/30 ${
        selected ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-sm leading-tight">{skill.name}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_COLORS[skill.source]}`}>
          {skill.source === "hubspot" ? "HubSpot" : "Community"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5">{skill.description}</p>
      <p className="text-[11px] text-muted-foreground/70">by {skill.creator}</p>
    </button>
  );
}

function SkillDetail({ skill }: { skill: Skill }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleFetch = async () => {
    if (content) { setShowContent((s) => !s); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSkillContent({ data: { rawUrl: skill.rawUrl! } });
      setContent(res.content);
      setShowContent(true);
    } catch (e: any) {
      setError(e?.message ?? "Could not fetch skill file.");
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const copyCmd = () => {
    if (!skill.installCmd) return;
    navigator.clipboard.writeText(skill.installCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-semibold text-lg leading-tight">{skill.name}</h3>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${SOURCE_COLORS[skill.source]}`}>
            {skill.source === "hubspot" ? "HubSpot" : "Community"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">by {skill.creator}</p>
      </div>
      <p className="text-sm">{skill.description}</p>
      <div className="space-y-2">
        {skill.highlights.map((h, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="text-primary font-bold shrink-0">→</span>
            <span>{h}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skill.tags.map((t) => (
          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
        ))}
      </div>
      <Separator />
      {skill.downloadUrl && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Go grab it</p>
          <p className="text-sm text-muted-foreground">
            Free. Takes 30 seconds to sign up on HubSpot's offers portal. No excuses.
          </p>
          <a href={skill.downloadUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Get it Free on HubSpot
            </Button>
          </a>
        </div>
      )}
      {skill.rawUrl && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Drop it into Claude</p>
          <p className="text-sm text-muted-foreground">
            Peek at the file, copy the whole thing, paste it into a Claude Project. You just gave Claude a specialist brain.
          </p>
          {skill.installCmd && (
            <div className="rounded-md bg-muted border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Terminal className="h-3.5 w-3.5" />
                  Install in Claude Code
                </div>
                <button onClick={copyCmd} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copiedCmd ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedCmd ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="px-3 py-2.5 text-xs font-mono text-foreground whitespace-pre-wrap">{skill.installCmd}</pre>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleFetch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : showContent ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {loading ? "Fetching..." : showContent ? "Put it away" : "Peek inside"}
            </Button>
            {skill.repoUrl && (
              <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
              </a>
            )}
          </div>
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><p>{error}</p>
            </div>
          )}
          {showContent && content && (
            <div className="rounded-md border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted">
                <span className="text-xs font-medium text-muted-foreground">SKILL.md</span>
                <button onClick={copyContent} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copiedContent ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedContent ? "Grabbed!" : "Copy to Claude"}
                </button>
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground">{content}</pre>
              </div>
            </div>
          )}
        </div>
      )}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">How it works:</strong> Copy the SKILL.md content and drop it into a Claude Project as a file — or paste it as your system prompt. From that moment on, Claude thinks like a specialist. It's like hiring someone who's already read everything.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── HubSpot Prompts components ────────────────────────────────────────────────

function PromptCard({ prompt, onClick }: { prompt: HubSpotPrompt; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden group`}
    >
      {/* Colored top strip */}
      <div className={`h-1.5 w-full ${CATEGORY_BG[prompt.category]}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${CATEGORY_COLORS[prompt.category]}`}>
            {prompt.category}
          </span>
          <span className="text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            {prompt.useCase}
          </span>
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-2">{prompt.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{prompt.prompt}</p>
      </div>
    </button>
  );
}

function PromptModal({ prompt, onClose }: { prompt: HubSpotPrompt; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-xl border shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${CATEGORY_COLORS[prompt.category]}`}>
                {prompt.category}
              </span>
              <span className="text-xs text-muted-foreground">{prompt.useCase}</span>
            </div>
            <h2 className="font-semibold text-lg">{prompt.title}</h2>
          </div>
          <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{prompt.prompt}</p>
        </div>
        <div className="p-4 border-t bg-muted/30 flex gap-2">
          <Button onClick={copy} className="flex-1 gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Stolen!" : "Steal This Prompt"}
          </Button>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

function HubSpotPromptsTab() {
  const [activeCategory, setActiveCategory] = useState<HubSpotCategory | "All">("All");
  const [activeUseCase, setActiveUseCase] = useState<string>("All");
  const [selectedPrompt, setSelectedPrompt] = useState<HubSpotPrompt | null>(null);

  const filtered = HUBSPOT_PROMPTS.filter((p) => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const ucMatch = activeUseCase === "All" || p.useCase === activeUseCase;
    return catMatch && ucMatch;
  });

  const useCasesForCategory =
    activeCategory === "All"
      ? []
      : Array.from(new Set(HUBSPOT_PROMPTS.filter((p) => p.category === activeCategory).map((p) => p.useCase)));

  const counts: Partial<Record<HubSpotCategory | "All", number>> = { All: HUBSPOT_PROMPTS.length };
  for (const cat of HUBSPOT_CATEGORIES) {
    counts[cat] = HUBSPOT_PROMPTS.filter((p) => p.category === cat).length;
  }

  return (
    <>
      {selectedPrompt && (
        <PromptModal prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
      )}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0 space-y-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Show me</p>
            <p className="text-xs text-muted-foreground mb-3">by team</p>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveCategory("All"); setActiveUseCase("All"); }}
                className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                  activeCategory === "All" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                Everything
                <span className={`text-xs tabular-nums ${activeCategory === "All" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {counts["All"]}
                </span>
              </button>
              {HUBSPOT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setActiveUseCase("All"); }}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    activeCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {cat}
                  <span className={`text-xs tabular-nums ${activeCategory === cat ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {counts[cat]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {useCasesForCategory.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">specifically for</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveUseCase("All")}
                  className={`w-full text-left rounded-md px-3 py-1.5 text-xs transition-colors ${
                    activeUseCase === "All" ? "bg-muted font-medium" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  All
                </button>
                {useCasesForCategory.map((uc) => (
                  <button
                    key={uc}
                    onClick={() => setActiveUseCase(uc)}
                    className={`w-full text-left rounded-md px-3 py-1.5 text-xs transition-colors ${
                      activeUseCase === uc ? "bg-muted font-medium" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {uc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} prompt{filtered.length !== 1 ? "s" : ""} to steal
              {activeCategory !== "All" ? ` · ${activeCategory}` : ""}
            </p>
            <a
              href="https://offers.hubspot.com/claude-connector-prompt-library"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on HubSpot
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} onClick={() => setSelectedPrompt(prompt)} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function SkillsPage() {
  const [selected, setSelected] = useState<Skill>(SKILLS[0]);
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? SKILLS
      : SKILLS.filter((s) => s.source === filter || s.tags.includes(filter));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">The Cheat Codes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The best email brains on the internet, bottled into files. Pick one. Drop it into Claude. Go write something people actually want to read.
        </p>
      </div>

      <Tabs defaultValue="skills">
        <TabsList className="mb-4">
          <TabsTrigger value="skills" className="gap-2">
            <BookMarked className="h-3.5 w-3.5" />
            Steal a Brain
          </TabsTrigger>
          <TabsTrigger value="hubspot" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            HubSpot's Moves
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilter(tag)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      filter === tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag === "hubspot" ? "HubSpot" : tag}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {filtered.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    selected={selected.id === skill.id}
                    onClick={() => setSelected(skill)}
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <SkillDetail key={selected.id} skill={selected} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hubspot">
          <HubSpotPromptsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen, Copy, Check, Zap, Mail, Star,
  ChevronDown, ChevronUp, Eye, Search, TrendingUp,
  Users, Target, PenLine, Clock, Smartphone, FlaskConical,
  Workflow, ShieldCheck, AlertTriangle, XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playbook")({
  head: () => ({ meta: [{ title: "The Playbook — Loopwise" }] }),
  component: Playbook,
});

// ─── HOOKS ──────────────────────────────────────────────────────────────────

const HOOK_CATS = ["All", "Pain-Aware", "Insight", "Social Proof", "Curiosity", "Personalized", "Story"] as const;

const hooks = [
  {
    category: "Pain-Aware",
    text: "Most [title]s I talk to are struggling with [specific pain]. Sound familiar?",
    example: "Most RevOps leads I talk to are drowning in CRM cleanup after a missed quarter. Sound familiar?",
    why: "Creates instant identification. They self-qualify before you mention your product.",
    perf: "High",
  },
  {
    category: "Pain-Aware",
    text: "I noticed [company] is hiring [role]. That usually signals [challenge].",
    example: "I noticed Acme is hiring 3 SDRs. That usually means the current team is maxed on capacity.",
    why: "Job postings are public pain signals. Shows research without feeling invasive.",
    perf: "High",
  },
  {
    category: "Pain-Aware",
    text: "Your [observable metric/thing] suggests [pain]. That's likely costing [outcome].",
    example: "Your NPS dropped 12 points last quarter. That's typically a $200K+ churn signal.",
    why: "Quantifying the cost of inaction makes the pain concrete and urgent.",
    perf: "Medium",
  },
  {
    category: "Insight",
    text: "The best [outcome] doesn't come from [conventional approach]. It comes from [contrarian take].",
    example: "The best reply rates don't come from longer follow-up sequences. They come from shorter, more direct ones.",
    why: "Challenges the status quo and positions you as someone who knows something they don't.",
    perf: "Medium",
  },
  {
    category: "Insight",
    text: "[X]% of [titles] do [thing]. The ones hitting [goal] do [Y] instead.",
    example: "72% of outbound teams send 5+ follow-ups. The ones hitting 15%+ reply rates stop at 3 — and make each count.",
    why: "Stat + contrast creates instant curiosity about which group they're in.",
    perf: "Medium",
  },
  {
    category: "Social Proof",
    text: "[Company in same space] went from [X] to [Y] in [timeframe]. Here's what changed.",
    example: "A Series B SaaS similar to yours went from 4% to 13% reply rate in 6 weeks. One change made the difference.",
    why: "Proof + curiosity gap. They need to know what changed.",
    perf: "High",
  },
  {
    category: "Social Proof",
    text: "3 of your competitors are already [doing X]. Thought you'd want to know.",
    example: "3 of your competitors (Acme, Zenith, Orbis) are already running AI-personalized outbound. Thought you'd want to know.",
    why: "Competitive FOMO is one of the strongest motivators in B2B buying.",
    perf: "High",
  },
  {
    category: "Curiosity",
    text: "I'm going to say something that might sound weird...",
    example: "I'm going to say something that might sound weird — your biggest conversion problem probably isn't your copy.",
    why: "Pure pattern interrupt. Nothing in their inbox starts like this. They have to keep reading.",
    perf: "Medium",
  },
  {
    category: "Curiosity",
    text: "Quick question — do you use [tool/method] for [task], or are you going off [alternative]?",
    example: "Quick question — do you use intent data for your outbound sequences, or are you going off firmographics only?",
    why: "Feels like a conversation opener, not a pitch. Low friction. Easy to answer yes or no.",
    perf: "High",
  },
  {
    category: "Personalized",
    text: "I read your [post/interview/article] about [topic]. Your point about [X] is exactly why I reached out.",
    example: "I read your LinkedIn post about pipeline anxiety going into Q3. Your point about SDR morale hit home.",
    why: "Demonstrates real research. Most people don't bother — this immediately stands out.",
    perf: "Very High",
  },
  {
    category: "Personalized",
    text: "Congrats on [recent public achievement]. That kind of growth usually comes with [specific challenge].",
    example: "Congrats on the Series B. That kind of growth usually comes with 'scale outbound fast' pressure.",
    why: "Celebrates them first, then pivots to a challenge that's natural at their stage.",
    perf: "High",
  },
  {
    category: "Story",
    text: "I was on a call last week with a [title] who told me '[verbatim quote]'.",
    example: "I was on a call last week with a VP Sales who said 'our problem isn't leads — it's not knowing which ones to call first.'",
    why: "Shares a real moment from a real conversation. Humanizes the outreach instantly.",
    perf: "Medium",
  },
  {
    category: "Story",
    text: "In [timeframe], [company/person] was about to [fail]. Then they did [one thing].",
    example: "In Jan 2023, a 12-person outbound team was about to get cut. Then they switched from volume to precision — 90 days later, pipeline tripled.",
    why: "Mini story arc. Our brains are wired to follow a narrative. The tension creates a need for resolution.",
    perf: "Medium",
  },
];

// ─── TEMPLATES ──────────────────────────────────────────────────────────────

const TEMPLATE_TYPES = ["All", "Cold", "Follow-up", "Nurture", "Re-engagement"] as const;

const templates = [
  {
    type: "Cold",
    name: "The Problem-First",
    subject: "Quick question about [specific thing at their company]",
    body: `[Personalized hook showing you noticed something specific about them]

We help [title]s at [company type] [outcome in plain language] — without [the thing they dread].

[Similar company] went from [X] to [Y] in [timeframe] using this approach.

Worth a 15-min chat to see if there's a fit?

[Signature]`,
    notes: [
      "Open with something you noticed about THEM — not your product, not your company",
      "State what you do in one sentence, in plain language, no jargon",
      "Lead social proof with a specific metric, not a logo",
      "Close with a yes/no question — 'would love to connect' is not a question",
    ],
    why: "Leads with their world, not yours. Every line earns the next.",
  },
  {
    type: "Cold",
    name: "The One-Sentence Ask",
    subject: "Re: [relevant topic]",
    body: `[First name] — are you open to a 10-minute call this week to explore whether [specific outcome] makes sense for [company]?

[Your name]`,
    notes: [
      "Ultra-short emails respect their time and signal confidence",
      "The 'Re:' subject creates a reply-thread feel — use once, early in the sequence",
      "Naming their company shows this isn't a blast — even if it is",
    ],
    why: "Sometimes the boldest move is the shortest email. No preamble, no sell — just an honest ask.",
  },
  {
    type: "Follow-up",
    name: "The Value-Add Bump",
    subject: "One thing that might help",
    body: `[First name],

Following up on my note from last week.

In the meantime — [one genuinely useful insight, stat, or resource relevant to their role and situation]. No strings attached.

Still happy to connect if the timing works.

[Name]`,
    notes: [
      "Give before you ask — every follow-up should add something, not just chase a response",
      "Never say 'just following up' — signals you have nothing new to offer",
      "'If timing works' lowers resistance by removing pressure",
    ],
    why: "Makes you feel like a helpful peer. When the time comes, they call you — not the competition.",
  },
  {
    type: "Follow-up",
    name: "The Direct Check-In",
    subject: "Still relevant?",
    body: `[First name] — quick check-in.

Still relevant, or should I hold off?

[Name]`,
    notes: [
      "3 words + one question. Near-impossible to ignore without feeling rude",
      "Giving them an easy 'no' paradoxically increases response rate",
      "Use after 2 non-replies — shows you respect their inbox",
    ],
    why: "Acknowledges the silence without guilt-tripping. The easiest email in the world to respond to.",
  },
  {
    type: "Nurture",
    name: "The Quick Win",
    subject: "One thing that changed [metric] for [company type]",
    body: `[First name],

[Valuable insight or tactic upfront — no preamble, no pitch. Make it immediately usable.]

Quick background on why this works: [2–3 sentences of honest reasoning]

You might already be doing this. But if not — happy to walk through how [similar companies] applied it.

[Name]

P.S. [Link to a deeper resource, case study, or relevant example]`,
    notes: [
      "Lead with value, not with yourself or your company",
      "'You might already be doing this' is disarming — removes defensiveness before it forms",
      "P.S. lines get read first — use them for your most important CTA",
    ],
    why: "Teaches them something they can use now. When the time comes to buy, you're the person they trust.",
  },
  {
    type: "Nurture",
    name: "The Counter-Intuitive Take",
    subject: "The thing most [titles] get wrong about [topic]",
    body: `[First name],

Here's a take most people in [role/industry] push back on at first:

[Contrarian insight that challenges conventional wisdom — be specific, not vague]

The data behind this: [evidence, example, or story]

What changed the mind of most people I've shared this with: [concrete outcome]

Curious whether this matches what you're seeing at [company].

[Name]`,
    notes: [
      "Contrarian insights drive more replies than agreeable ones — agreement needs no response",
      "A genuine question at the end makes responding feel natural, not transactional",
      "Works best when the insight is hyper-specific to their industry or role",
    ],
    why: "Makes them think. If you challenge their mental model with evidence, they want to engage.",
  },
  {
    type: "Re-engagement",
    name: "The Breakup Email",
    subject: "Should I stop reaching out?",
    body: `[First name],

I've reached out a few times without hearing back — I get it, timing might just be off.

Before I close this out: [One final piece of value or a question that might be genuinely relevant to them right now]

If now's not a good time, just say the word and I'll leave you alone.

[Name]`,
    notes: [
      "'Should I stop reaching out?' consistently gets some of the highest response rates of any subject line",
      "Acknowledge the silence honestly — don't pretend the previous emails didn't happen",
      "Giving them an explicit easy out often unlocks a 'yes' or a 'not yet but...'",
      "One more value add makes you memorable even if they never reply",
    ],
    why: "Permission to say no makes it psychologically safe to respond. Many reply just to close the loop.",
  },
  {
    type: "Re-engagement",
    name: "The Things Changed Email",
    subject: "Things have changed since we last spoke",
    body: `[First name],

It's been a few months. A lot has changed:

• [New capability, approach, or result — 1 line]
• [Relevant win from a recent customer — 1 specific line]
• [Something that changed in their industry or market — 1 line]

If [original challenge] is still on your radar, I think the conversation would look different now.

Open to a quick reconnect?

[Name]`,
    notes: [
      "Bullet points signal this is worth skimming — dense paragraphs get skipped in re-engagement",
      "Referencing an industry change shows you're tracking their world, not just checking in on yourself",
      "'The conversation would look different now' resets the relationship without pretending history didn't happen",
    ],
    why: "Shows evolution on both sides. Lets you re-pitch without repeating the same pitch.",
  },
];

// ─── SUBJECT LINE FORMULAS ───────────────────────────────────────────────────

const subjectFormulas = [
  {
    formula: "The Minimal Question",
    pattern: "Quick ? about [topic]",
    examples: ["Quick ? about your outbound motion", "Quick ? about [company]'s SDR team", "Quick ? before Q4"],
    benchmark: "48–55% open",
    tip: "3 words max. Curiosity without revealing anything. Feels like a text from a colleague, not a cold email.",
  },
  {
    formula: "The Result Proof",
    pattern: "How [Company] [achieved specific result]",
    examples: ["How Deel went from 4% to 18% reply rate", "How this SDR team booked 30 meetings in 30 days", "How [competitor] is outpacing you on outbound"],
    benchmark: "38–46% open",
    tip: "The more specific the result and recognizable the company, the better. Never make up the numbers.",
  },
  {
    formula: "The Honest Direct",
    pattern: "I'll be direct, [Firstname] / Honest question",
    examples: ["I'll be direct, Sarah", "Honest question, Marcus", "No fluff — is this relevant?"],
    benchmark: "42–52% open",
    tip: "Works especially well for re-engagement or when prior emails haven't landed. Disarms the defense mechanism.",
  },
  {
    formula: "The Observation",
    pattern: "Noticed [specific thing about them]",
    examples: ["Noticed your outbound team doubled last quarter", "Noticed [company] just launched in EMEA", "Saw your post about pipeline anxiety"],
    benchmark: "44–58% open",
    tip: "Best for ABM or high-value accounts. The specificity signals this isn't a blast — even before they open.",
  },
  {
    formula: "The FOMO Signal",
    pattern: "[N] of your competitors are already [doing X]",
    examples: ["3 of your competitors are already using AI sequencing", "Most [industry] teams have already made the switch", "[Competitor] just scaled outbound 4x — here's how"],
    benchmark: "36–44% open",
    tip: "Only works if you can be specific. Never fabricate competitor names. The specificity makes or breaks this formula.",
  },
  {
    formula: "The Thread Trick",
    pattern: "Re: [relevant topic]",
    examples: ["Re: your Q3 pipeline goals", "Re: scaling outbound", "Re: our conversation"],
    benchmark: "52–60% open",
    tip: "Creates a reply-thread feel. Use sparingly — once per contact, in a later sequence step. Overusing kills trust.",
  },
  {
    formula: "The Specific Number",
    pattern: "[Unusual number] [things/ways] for [outcome]",
    examples: ["7 subject lines that got 60%+ opens", "4 follow-up emails that close cold leads", "11 hooks that still work in 2025"],
    benchmark: "34–42% open",
    tip: "Odd numbers outperform round ones (7 beats 10, 11 beats 12). Specificity implies data, not a listicle.",
  },
];

// ─── HUBSPOT SUBJECT LINE LIBRARY ────────────────────────────────────────────

const HS_CATS = ["All", "Cold Email", "Follow-Up", "Re-engagement", "Meeting", "Attention-Grabbing", "Retargeting", "Newsletter", "Professional", "HubSpot Picks"] as const;

const hubspotLines: { cat: typeof HS_CATS[number]; line: string }[] = [
  // Cold Email
  { cat: "Cold Email", line: "Quick question about [goal]" },
  { cat: "Cold Email", line: "[Mutual connection] recommended I get in touch" },
  { cat: "Cold Email", line: "Hi [name], [question]?" },
  { cat: "Cold Email", line: "Did you get what you were looking for?" },
  { cat: "Cold Email", line: "Ready to help" },
  { cat: "Cold Email", line: "A [benefit] for [prospect's company]" },
  { cat: "Cold Email", line: "X tips/ideas for [pain point]" },
  { cat: "Cold Email", line: "Idea for [topic the prospect cares about]" },
  { cat: "Cold Email", line: "2x [prospect's company]'s pipeline in 10 days" },
  { cat: "Cold Email", line: "We have [insert fact] in common..." },
  { cat: "Cold Email", line: "Feeling [insert emotion]? Let me help" },
  { cat: "Cold Email", line: "Hoping you can help" },
  { cat: "Cold Email", line: "This is a [your industry here] sales email" },
  { cat: "Cold Email", line: "Your yearly [X] target" },
  { cat: "Cold Email", line: "[Situation] at [Company]" },
  { cat: "Cold Email", line: "Who is in charge of X at [company]?" },
  { cat: "Cold Email", line: "Let's cut to the chase" },
  { cat: "Cold Email", line: "I might be off-base here, but..." },
  { cat: "Cold Email", line: "Your peers tell me they struggle with [pain point]. Do you?" },
  { cat: "Cold Email", line: "Can I make your life 20% easier?" },
  { cat: "Cold Email", line: "[Name], I saw you're focused on [goal]" },
  { cat: "Cold Email", line: "Will I see you at [event]?" },
  { cat: "Cold Email", line: "Tired of salespeople who never give up?" },
  { cat: "Cold Email", line: "[Name] suggested I reach out" },
  { cat: "Cold Email", line: "[Referral name] loves us & thought you might, too" },
  { cat: "Cold Email", line: "Fellow [University] grad here!" },
  { cat: "Cold Email", line: "Have you tried [restaurant in prospect's town]?" },
  { cat: "Cold Email", line: "Am I assuming correctly?" },
  { cat: "Cold Email", line: "[prospect's company] x [your company]" },
  { cat: "Cold Email", line: "May seem off-base, but hear us out…" },
  { cat: "Cold Email", line: "Sharing an industry secret with you, [Name]" },
  { cat: "Cold Email", line: "Impressed by your [achievement/project]" },
  { cat: "Cold Email", line: "One solution for [prospect's challenge]" },
  { cat: "Cold Email", line: "Curious about your thoughts on [specific idea]" },
  // Follow-Up
  { cat: "Follow-Up", line: "Our next steps" },
  { cat: "Follow-Up", line: "X options you can get started on Y" },
  { cat: "Follow-Up", line: "You are not alone." },
  { cat: "Follow-Up", line: "Do you have 10 mins on [date]?" },
  { cat: "Follow-Up", line: "A 3-step plan for your busy week" },
  { cat: "Follow-Up", line: "[Prospect], I thought these articles would interest you" },
  { cat: "Follow-Up", line: "Here's that info I promised you" },
  { cat: "Follow-Up", line: "I'd love your feedback on that meeting" },
  { cat: "Follow-Up", line: "I had this idea since we last spoke" },
  { cat: "Follow-Up", line: "I thought about what you said" },
  { cat: "Follow-Up", line: "Don't tell my boss" },
  { cat: "Follow-Up", line: "What would it take?" },
  { cat: "Follow-Up", line: "Here's what I'll do" },
  { cat: "Follow-Up", line: "Talk on [day] at [1:45]?" },
  { cat: "Follow-Up", line: "[Prospect], I loved your post on [website]" },
  { cat: "Follow-Up", line: "Hi [Prospect], we met at [event]" },
  { cat: "Follow-Up", line: "Still undecided? This might help" },
  { cat: "Follow-Up", line: "Try [product/service] for free" },
  { cat: "Follow-Up", line: "Wondering if you got my last email" },
  // Re-engagement
  { cat: "Re-engagement", line: "Do not open this email" },
  { cat: "Re-engagement", line: "Should I stay, or should I go?" },
  { cat: "Re-engagement", line: "Know this about [topic of interest]?" },
  { cat: "Re-engagement", line: "Permission to close your file?" },
  { cat: "Re-engagement", line: "Wishing you and your business the best" },
  { cat: "Re-engagement", line: "If you change your mind about partnering with [your company]" },
  { cat: "Re-engagement", line: "HBO Go password?" },
  { cat: "Re-engagement", line: "Be honest, are you ghosting me?" },
  { cat: "Re-engagement", line: "Reaching out once more (LMK either way)" },
  { cat: "Re-engagement", line: "Should I stop reaching out?" },
  { cat: "Re-engagement", line: "Things have changed since we last spoke" },
  { cat: "Re-engagement", line: "Closing your file" },
  // Meeting Request
  { cat: "Meeting", line: "15 minutes this week?" },
  { cat: "Meeting", line: "Requesting a meeting on [day]" },
  { cat: "Meeting", line: "Time for a quick touch base?" },
  { cat: "Meeting", line: "Meeting invite: [Date]" },
  { cat: "Meeting", line: "[Company name] + [Company name]: [Date]" },
  { cat: "Meeting", line: "Talk on [day] at [time]?" },
  // Attention-Grabbing
  { cat: "Attention-Grabbing", line: "*Don't Open This Email*" },
  { cat: "Attention-Grabbing", line: "Important Weather Advisory" },
  { cat: "Attention-Grabbing", line: "What Can You Afford?" },
  { cat: "Attention-Grabbing", line: "As You Wish" },
  { cat: "Attention-Grabbing", line: "Not Cool, Guys" },
  { cat: "Attention-Grabbing", line: "DO NOT Commit These Instagram Atrocities" },
  { cat: "Attention-Grabbing", line: "Everything you wanted to know about email copy but were too afraid to ask" },
  { cat: "Attention-Grabbing", line: "Abra-cord-abra! Yeah, we said it." },
  { cat: "Attention-Grabbing", line: "🔥 Hot freebie alert! 15 free gifts, you pick 5." },
  { cat: "Attention-Grabbing", line: "Don't let your [product] trial expire" },
  { cat: "Attention-Grabbing", line: "Now it's personal — [product's] biggest leap yet" },
  { cat: "Attention-Grabbing", line: "Your new competitive advantage" },
  { cat: "Attention-Grabbing", line: "The future of [prospect's industry] starts here" },
  { cat: "Attention-Grabbing", line: "Say goodbye to [pain point]" },
  { cat: "Attention-Grabbing", line: "How we can triple your ROI in just 30 days" },
  { cat: "Attention-Grabbing", line: "Don't let outdated tactics hold you back" },
  { cat: "Attention-Grabbing", line: "This is the most boring email you'll read today. (Maybe)" },
  { cat: "Attention-Grabbing", line: "Have you given up on [initiative]? Try this hack." },
  { cat: "Attention-Grabbing", line: "[Name], ready to be more productive?" },
  { cat: "Attention-Grabbing", line: "The ultimate playbook for unprecedented results" },
  // Retargeting
  { cat: "Retargeting", line: "We Saw You Checking Us Out 😏" },
  { cat: "Retargeting", line: "Uh-oh, your prescription is expiring" },
  { cat: "Retargeting", line: "The timer's going off on your cart!" },
  { cat: "Retargeting", line: "What Did You Think? Write a Review." },
  { cat: "Retargeting", line: "A Sneak Peek for VIPs Only." },
  { cat: "Retargeting", line: "Want some more time? It's on us" },
  { cat: "Retargeting", line: "Your cart is getting lonely" },
  // Newsletter
  { cat: "Newsletter", line: "China Falls, Sleepy Unicorns, And The Deals Aren't Bigger In Texas" },
  { cat: "Newsletter", line: "Watch Out for This Amazon Phishing Scam." },
  { cat: "Newsletter", line: "Buffer has been hacked — here is what's going on" },
  { cat: "Newsletter", line: "Black Friday shoppers are the worst customers" },
  { cat: "Newsletter", line: "New recipe alert 🚨" },
  { cat: "Newsletter", line: "Tips to increase remote collaboration" },
  { cat: "Newsletter", line: "I got Botox — & THIS is what it looked like" },
  { cat: "Newsletter", line: "Improve Your Website from Concept to Code 💻" },
  { cat: "Newsletter", line: "The best options for grocery delivery" },
  { cat: "Newsletter", line: "Mark your calendar for these key dates!" },
  { cat: "Newsletter", line: "'I didn't realize architecture was so dangerous'" },
  { cat: "Newsletter", line: "Rock the color of the year" },
  { cat: "Newsletter", line: "Where to Drink Beer Right Now" },
  { cat: "Newsletter", line: "Best of Groupon: The Deals That Make Us Proud (Unlike Our Nephew, Steve)" },
  // Professional
  { cat: "Professional", line: "[Client] sent you a payment - it's arriving [date]" },
  { cat: "Professional", line: "[Action Required] Verify your email address" },
  { cat: "Professional", line: "Your free PDF is attached: Great Talks Most People Have Never Heard" },
  { cat: "Professional", line: "Whoops — we hadn't had our coffee this morning" },
  { cat: "Professional", line: "Request for your expert opinion, [Name]" },
  { cat: "Professional", line: "Important update regarding our partnership" },
  { cat: "Professional", line: "Best practices for [specific goal]" },
  { cat: "Professional", line: "Action required: Response needed by [date]" },
  { cat: "Professional", line: "Join our webinar for insider insights" },
  { cat: "Professional", line: "Your opinion matters — quick survey inside" },
  { cat: "Professional", line: "Follow-up on our recent conversation" },
  { cat: "Professional", line: "Invitation to our exclusive [event/webinar]" },
  { cat: "Professional", line: "Hi, [Name]. Are you up for a collaboration?" },
  // HubSpot Picks
  { cat: "HubSpot Picks", line: "Hmm...No writing activity last week?" },
  { cat: "HubSpot Picks", line: "Drooling over email designs 🤤" },
  { cat: "HubSpot Picks", line: "Can you help me name this dance, [First Name]?" },
  { cat: "HubSpot Picks", line: "Who you gonna call?" },
  { cat: "HubSpot Picks", line: "Shoes You Can Wear All Damn Day" },
  { cat: "HubSpot Picks", line: "You were on point last week 🎯" },
  { cat: "HubSpot Picks", line: "Show them what you're made of" },
  { cat: "HubSpot Picks", line: "'Not intended for swimming'" },
  { cat: "HubSpot Picks", line: "Our #1 most asked question…" },
  { cat: "HubSpot Picks", line: "[First Name]! You're One of HubSpot's Top Blog Readers 🎉" },
  { cat: "HubSpot Picks", line: "1,750 points for you. Valentine's flowers & more for them." },
  { cat: "HubSpot Picks", line: "Ending Soon | Favorites Up To 70% Off ⏳" },
];

// ─── NON-NEGOTIABLES ─────────────────────────────────────────────────────────

const nonNegotiables = [
  {
    title: "Real sender name & address",
    wrong: "noreply@yourcompany.com or 'The Team'",
    why: "CAN-SPAM legally requires recipients to be able to reply. 'noreply' also kills trust — people want to know a human sent this. Use jamie@company.com.",
  },
  {
    title: "One CTA per email",
    wrong: "Multiple links, multiple asks, multiple CTAs",
    why: "Every additional CTA you add reduces clicks on all of them. One email, one job. If you need three actions, send three emails.",
  },
  {
    title: "An unsubscribe link",
    wrong: "No opt-out mechanism anywhere in the email",
    why: "Legally required under CAN-SPAM, GDPR, and CASL — no exceptions. Missing it can result in fines. More importantly, forcing people to stay = spam complaints that nuke your deliverability.",
  },
  {
    title: "Subject line under 50 characters",
    wrong: "Long subject lines that get cut off on mobile",
    why: "Over 60% of emails are opened on mobile. Anything beyond 50 chars gets truncated. Your hook disappears. Test every subject line on mobile before sending.",
  },
  {
    title: "Preview text that adds context",
    wrong: "'View this email in your browser...' or blank preview text",
    why: "Preview text is the second thing people read after the subject line. Leaving it blank lets the email client pull random copy. You have 40–90 characters of free real estate — use them.",
  },
  {
    title: "Personalized greeting",
    wrong: "'Dear Member', 'Hi there', or no greeting at all",
    why: "Generic greetings signal a blast. 'Hi [First Name]' takes one token. It's not just polite — personalized greetings measurably increase opens and trust from the first line.",
  },
  {
    title: "Main message above the fold",
    wrong: "Long preamble before you get to the point",
    why: "People spend an average of 9 seconds on an email. If your key message and CTA require scrolling, most people never see them. Lead with the point, support it below.",
  },
  {
    title: "Mobile-safe email width (500–650px)",
    wrong: "Wide email layouts that break on mobile screens",
    why: "Anything over 650px causes horizontal scrolling on mobile — which is an immediate delete. Design at 600px and test on a real phone before every campaign launch.",
  },
];

// ─── HUBSPOT TACTICS ─────────────────────────────────────────────────────────

const hubspotStats = [
  { label: "Email ROI", value: "$36", sub: "returned per $1 spent" },
  { label: "Segmentation lift", value: "90%", sub: "of marketers report higher perf" },
  { label: "Abandoned cart", value: "29%", sub: "of email revenue comes from these" },
  { label: "Welcome emails", value: "50%", sub: "higher engagement than standard" },
];

const hubspotTactics = [
  {
    icon: Users,
    category: "List Building",
    color: "text-blue-600",
    bg: "bg-blue-50",
    points: [
      "Use lead magnets (ebooks, templates, webinars, tools) to attract quality subscribers",
      "Double opt-in confirmation — confirms genuine interest and protects deliverability",
      "Never purchase email lists — violates GDPR, tanks open rates, damages sender rep",
      "Build organically through earned opt-ins, not volume hacks",
      "Add a subscribe CTA to forwarded emails to capture secondhand readers",
    ],
  },
  {
    icon: Target,
    category: "Segmentation & Personalization",
    color: "text-violet-600",
    bg: "bg-violet-50",
    points: [
      "Segment by: lifecycle stage, geography, industry, past engagement, purchase history",
      "Segmented campaigns generate 30% more opens and 50% more clickthroughs",
      "Personalize subject lines with first name — drives up to 26% lift in open rates",
      "Base personalization on 2–3 factors, not just one engagement signal",
      "Match content to buyer journey: awareness → educational, decision → testimonials + offers",
    ],
  },
  {
    icon: PenLine,
    category: "Copy & Content",
    color: "text-amber-600",
    bg: "bg-amber-50",
    points: [
      "Write conversationally — as though speaking directly to one person",
      "Address a single topic per email — multiple asks dilute action",
      "Keep subject lines under 50 characters for mobile (55% of emails open on mobile)",
      "Preview text should supplement your subject line — not repeat it",
      "People spend avg 9 seconds on an email — main message must be above the fold",
      "Avoid 'Dear Member' — personalized greetings outperform generic ones significantly",
    ],
  },
  {
    icon: Clock,
    category: "Timing & Frequency",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    points: [
      "Best day to send: Tuesday (consistently outperforms across industries)",
      "Best windows: Early morning 4–6 AM or late afternoon 5–7 PM",
      "Optimal frequency: 1–4 emails per month — more than 4 drives unsubscribes",
      "Wait 2–7 days between first email and follow-up (don't chase same-day)",
      "Use send-time optimization that adapts to each contact's historical open pattern",
      "Unsubscribe target: below 0.5% | Spam complaints: below 0.08%",
    ],
  },
  {
    icon: Smartphone,
    category: "Mobile-First Design",
    color: "text-rose-600",
    bg: "bg-rose-50",
    points: [
      "60%+ of emails are opened on mobile — design there first, desktop second",
      "Keep email width to 500–650px to prevent horizontal scrolling",
      "Use max 2 typefaces, 10–12pt font size minimum for legibility",
      "Contrasting CTA button color — don't let it blend into the template",
      "White space isn't wasted space — it improves readability and click-through",
      "Always include alt text for images (many clients block images by default)",
    ],
  },
  {
    icon: FlaskConical,
    category: "A/B Testing",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    points: [
      "Test one variable at a time — subject line OR CTA OR send time, never all three",
      "Run tests simultaneously to eliminate timing as a confounding variable",
      "Subject line testing: try length, personalization token, question vs. statement",
      "CTA testing: try button placement higher in the email — CTR often increases",
      "Test graphic CTA vs inline copy — results vary significantly by audience",
      "Track opens, CTR, and unsubscribes — unsubscribes reveal content-audience mismatch",
    ],
  },
  {
    icon: Workflow,
    category: "Automation Sequences",
    color: "text-orange-600",
    bg: "bg-orange-50",
    points: [
      "Welcome sequence: send at Day 1, Day 5, and Day 10 post-subscription",
      "Include bonus content in automated sequence to incentivize engagement early",
      "Abandoned cart: first reminder within 1 hour, second at 24 hours",
      "Lead nurturing: map each step to a specific stage of the buyer journey",
      "42% of email marketers save 30min–2h/week using AI for sequence drafts",
      "Always review AI-generated copy — robotic tone kills engagement",
    ],
  },
  {
    icon: ShieldCheck,
    category: "Deliverability",
    color: "text-teal-600",
    bg: "bg-teal-50",
    points: [
      "Bounce rate above 2% damages your sender reputation — clean lists are essential",
      "Remove non-engaged subscribers regularly (gradual reduction: daily→weekly→monthly)",
      "Never use a no-reply sender address — CAN-SPAM requires recipients can respond",
      "Use a real human sender name: 'jamie@company.com' outperforms 'noreply@'",
      "Warm sending domains gradually before sending at volume",
      "Gmail throttles senders automatically — don't fight it, respect the signal",
    ],
  },
];

// ─── SWIPE FILE ──────────────────────────────────────────────────────────────

const swipeFile = [
  {
    label: "The 'We Built This For You' Launch",
    type: "Product Launch",
    subject: "We built this because you asked",
    preview: "We heard you. Async video had one big problem: nobody watched past 30 seconds...",
    triggers: ["Social validation", "Customer-centric framing", "Pain acknowledgment"],
    lesson: "Credit the reader for shaping the product. Makes them feel ownership before they've even tried the feature. 'Because you asked' is one of the most powerful phrases in email.",
    fullEmail: `Subject: We built this because you asked

We heard you. Async video had one big problem: nobody watched past 30 seconds.

So we built [Feature] — designed to keep viewers in until the moment that matters.

3 teams beta-tested it last month. Average watch-through went from 34% → 81%.

You're first to try it. →`,
  },
  {
    label: "The Radically Honest Cold Email",
    type: "Cold Outreach",
    subject: "I'll be honest with you",
    preview: "Most emails you get from people like me are designed to trick you into a call you didn't want...",
    triggers: ["Pattern interrupt", "Radical honesty", "Disarming tone"],
    lesson: "Admitting what you're doing (selling) before they accuse you of it removes the defense mechanism. They relax and actually read. Counterintuitively, being transparent about your intent increases trust.",
    fullEmail: `Subject: I'll be honest with you

Most emails you get from people like me are designed to trick you into a call you didn't want.

I'm not going to do that.

Here's what I'm actually asking: [Company] helps [role] at [company type] [achieve result]. We're good at it, and you look like the kind of company we could genuinely help.

15 minutes to find out? If it's not relevant, I'll tell you myself.

[Name]`,
  },
  {
    label: "The Fieldwork Authority Email",
    type: "Nurture (Educational)",
    subject: "The thing most RevOps leads get wrong",
    preview: "I've talked to 200+ RevOps leads this year. The single biggest mistake isn't what you think...",
    triggers: ["Authority signal", "Curiosity gap", "Peer reference"],
    lesson: "Positioning that you've done the fieldwork (talked to 200+ people) earns the right to have a contrarian take. The curiosity gap — 'isn't what you think' — forces them to read on.",
    fullEmail: `Subject: The thing most RevOps leads get wrong

I've talked to 200+ RevOps leads this year. The single biggest mistake isn't what you think.

It's not bad data. It's not the wrong tools.

It's measuring the wrong thing — and then optimizing furiously for a number that doesn't actually drive revenue.

Here's what the top 10% track instead: [resource/insight link]

Worth a read if you're heading into a QBR soon.

[Name]`,
  },
  {
    label: "The Respectful Breakup",
    type: "Re-engagement",
    subject: "Closing your file",
    preview: "I'm going to close out your file today. Not because I gave up — because I respect your inbox...",
    triggers: ["Loss aversion", "Respect signal", "Easy exit"],
    lesson: "Giving them permission to say no activates the reciprocity instinct. They often respond just to close the loop — and that conversation is warmer than any follow-up could have been.",
    fullEmail: `Subject: Closing your file

I'm going to close out your file today. Not because I gave up — because I respect your inbox.

If timing was just bad: feel free to reach back out whenever [pain] becomes a priority.

If I missed the mark entirely: one honest line back helps me stop bothering the wrong people.

Either way — good luck with Q4.

[Name]`,
  },
  {
    label: "The Deep ABM Email",
    type: "Cold (Account-Based)",
    subject: "3 things I noticed about [Company]",
    preview: "Spent 20 minutes on your site and LinkedIn this morning. Three things stood out...",
    triggers: ["Personalization depth", "Specificity", "Flattery through attention"],
    lesson: "Telling them you spent time researching them is flattering. Proving it with 3 specific observations makes them feel genuinely seen. Most cold emails signal 30 seconds of effort — this signals 20 minutes.",
    fullEmail: `Subject: 3 things I noticed about [Company]

Spent 20 minutes on your site and LinkedIn this morning. Three things stood out:

1. You're expanding into [market] — that's a significant GTM lift.
2. Your recent job posts signal [challenge] — scaling faster than process can support.
3. [Recent news or content] — you're clearly prioritizing [theme].

All three are areas where we've helped similar teams.

Worth 15 minutes to compare notes?

[Name]`,
  },
  {
    label: "The Concrete Proof Nurture",
    type: "Nurture (Results-led)",
    subject: "What 15% reply rate actually looks like",
    preview: "Most content about outbound stays abstract. Here's what it actually looks like at a 50-person SaaS...",
    triggers: ["Specificity over abstraction", "Practical framing", "Show-don't-tell proof"],
    lesson: "The word 'actually' in subject lines and body signals you're cutting through the noise. Promising specificity when everyone else is vague is a powerful differentiator. People are tired of frameworks — they want the exact thing that happened.",
    fullEmail: `Subject: What 15% reply rate actually looks like

Most content about outbound stays abstract. Here's what it actually looked like at a 50-person SaaS:

Week 1: Cut sequences from 8 steps to 3. Focused each step on one job.
Week 2: Rewrote every first line to reference something specific to each account.
Week 3: Reply rate moved from 4.2% → 9.8%.
Week 6: Holding steady at 13–15%.

The hard part wasn't the tactics. It was committing to doing less.

Full breakdown here: [link]

[Name]`,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const perfColor: Record<string, string> = {
  "Very High": "text-emerald-600 bg-emerald-50 border-emerald-200",
  High: "text-blue-600 bg-blue-50 border-blue-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
};

function CopyBtn({ text, size = "sm" }: { text: string; size?: "sm" | "xs" }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size={size === "xs" ? "sm" : "sm"}
      className={cn("shrink-0", size === "xs" ? "h-6 px-1.5 text-[11px]" : "h-7 px-2 text-xs")}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <><Check className="h-3 w-3 mr-1 text-emerald-500" />Copied</>
      ) : (
        <><Copy className="h-3 w-3 mr-1" />Copy</>
      )}
    </Button>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

function Playbook() {
  const [hookFilter, setHookFilter] = useState<typeof HOOK_CATS[number]>("All");
  const [templateFilter, setTemplateFilter] = useState<typeof TEMPLATE_TYPES[number]>("All");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [expandedSwipe, setExpandedSwipe] = useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectCat, setSubjectCat] = useState<typeof HS_CATS[number]>("All");

  const filteredHooks = hookFilter === "All" ? hooks : hooks.filter((h) => h.category === hookFilter);
  const filteredTemplates = templateFilter === "All" ? templates : templates.filter((t) => t.type === templateFilter);

  const filteredHSLines = useMemo(() => {
    return hubspotLines.filter((sl) => {
      const matchCat = subjectCat === "All" || sl.cat === subjectCat;
      const matchSearch = !subjectSearch || sl.line.toLowerCase().includes(subjectSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [subjectSearch, subjectCat]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="The Playbook"
        description="Everything stolen from the best email marketers alive. Hooks that stop the scroll, templates that get replies, subject lines that beg to be opened. Use all of it."
      />

      <Tabs defaultValue="hooks">
        <TabsList className="w-full justify-start gap-0.5 flex-wrap h-auto">
          <TabsTrigger value="hooks" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />Opening Lines
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5 text-xs">
            <Mail className="h-3.5 w-3.5" />Full Sends
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />Subject Lines
          </TabsTrigger>
          <TabsTrigger value="tactics" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" />The Commandments
          </TabsTrigger>
          <TabsTrigger value="swipe" className="gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5" />Steal These
          </TabsTrigger>
        </TabsList>

        {/* ── HOOKS ── */}
        <TabsContent value="hooks" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {HOOK_CATS.map((cat) => (
              <Button key={cat} variant={hookFilter === cat ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setHookFilter(cat)}>
                {cat}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredHooks.map((hook, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs">{hook.category}</Badge>
                    <Badge variant="outline" className={cn("text-xs", perfColor[hook.perf])}>{hook.perf} perf.</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 flex-1">
                  <blockquote className="rounded-md bg-muted px-4 py-3 text-sm font-medium leading-relaxed border-l-2 border-primary">
                    {hook.text}
                  </blockquote>
                  <p className="text-xs text-muted-foreground italic">e.g. &ldquo;{hook.example}&rdquo;</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Why it works: </span>{hook.why}
                  </p>
                  <div className="mt-auto pt-1"><CopyBtn text={hook.text} /></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── TEMPLATES ── */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_TYPES.map((type) => (
              <Button key={type} variant={templateFilter === type ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setTemplateFilter(type)}>
                {type}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredTemplates.map((tpl) => {
              const isOpen = expandedTemplate === tpl.name;
              return (
                <Card key={tpl.name} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">{tpl.type}</Badge>
                      <CopyBtn text={`Subject: ${tpl.subject}\n\n${tpl.body}`} />
                    </div>
                    <CardTitle className="text-base mt-1">{tpl.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">Subject: {tpl.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 flex-1">
                    <pre className="rounded-md bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap font-sans">{tpl.body}</pre>
                    <Button variant="ghost" size="sm" className="px-0 text-xs text-muted-foreground hover:text-foreground w-fit" onClick={() => setExpandedTemplate(isOpen ? null : tpl.name)}>
                      {isOpen ? <><ChevronUp className="h-3.5 w-3.5 mr-1" />Got it, collapse this</> : <><ChevronDown className="h-3.5 w-3.5 mr-1" />Break it down for me</>}
                    </Button>
                    {isOpen && (
                      <div className="rounded-md border bg-muted/40 p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What's happening here</p>
                        {tpl.notes.map((note, i) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                            <span className="text-muted-foreground">{note}</span>
                          </div>
                        ))}
                        <p className="text-xs pt-2 border-t mt-2"><span className="font-medium">The big idea: </span>{tpl.why}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── SUBJECT LINES ── */}
        <TabsContent value="subjects" className="mt-4 space-y-8">
          {/* Formulas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Formulas That Print Opens</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subjectFormulas.map((sf) => (
                <Card key={sf.formula} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm">{sf.formula}</CardTitle>
                      <Badge variant="outline" className="text-xs text-emerald-600 bg-emerald-50 border-emerald-200 shrink-0">{sf.benchmark}</Badge>
                    </div>
                    <code className="text-xs bg-muted rounded px-2 py-1.5 font-mono block mt-1">{sf.pattern}</code>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 flex-1">
                    {sf.examples.map((ex) => (
                      <div key={ex} className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2">
                        <span className="text-xs truncate">{ex}</span>
                        <CopyBtn text={ex} size="xs" />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground leading-relaxed mt-auto pt-2">
                      <span className="font-medium text-foreground">Use this when: </span>{sf.tip}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* HubSpot Library */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">HubSpot's Subject Line Vault</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredHSLines.length} of {hubspotLines.length} lines to steal · all from HubSpot's research
                </p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-xs"
                  placeholder="Search the vault..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HS_CATS.map((cat) => (
                <Button key={cat} variant={subjectCat === cat ? "default" : "outline"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setSubjectCat(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
            {filteredHSLines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nothing found. Try a different word — it's in there somewhere.</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredHSLines.map((sl, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">{sl.cat}</Badge>
                      <span className="text-xs truncate">{sl.line}</span>
                    </div>
                    <CopyBtn text={sl.line} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── HUBSPOT TACTICS ── */}
        <TabsContent value="tactics" className="mt-4 space-y-6">

          {/* Non-negotiables */}
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-destructive">The Non-Negotiables</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Miss any of these and you're better off not sending the email at all. Not joking.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {nonNegotiables.map((item) => (
                <div key={item.title} className="rounded-lg border border-destructive/20 bg-background p-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold leading-snug">{item.title}</span>
                  </div>
                  <p className="text-xs text-destructive/80 font-medium pl-5">
                    ✗ Common mistake: {item.wrong}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">{item.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {hubspotStats.map((s) => (
              <Card key={s.label} className="text-center">
                <CardContent className="py-4 px-3">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs font-medium mt-0.5">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hubspotTactics.map((tactic) => {
              const Icon = tactic.icon;
              return (
                <Card key={tactic.category} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", tactic.bg)}>
                        <Icon className={cn("h-4 w-4", tactic.color)} />
                      </div>
                      <CardTitle className="text-sm">{tactic.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {tactic.points.map((pt, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className={cn("font-bold shrink-0 mt-0.5", tactic.color)}>·</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center pb-2">
            Source: HubSpot Email Marketing Guide, 22 Email Best Practices, and State of Email 2024–2025 research
          </p>
        </TabsContent>

        {/* ── SWIPE FILE ── */}
        <TabsContent value="swipe" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {swipeFile.map((card) => {
              const key = card.label;
              const isOpen = expandedSwipe === key;
              return (
                <Card key={key} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <span className="text-sm font-semibold leading-snug">{card.label}</span>
                    <Badge variant="outline" className="text-xs w-fit">{card.type}</Badge>
                    <code className="text-xs bg-muted rounded px-2 py-1.5 font-mono block mt-1">
                      Subject: {card.subject}
                    </code>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 flex-1">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{card.preview}&rdquo;</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.triggers.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Why it landed: </span>{card.lesson}
                    </p>
                    <Button variant="ghost" size="sm" className="px-0 text-xs text-muted-foreground hover:text-foreground w-fit" onClick={() => setExpandedSwipe(isOpen ? null : key)}>
                      {isOpen ? <><ChevronUp className="h-3.5 w-3.5 mr-1" />I've seen enough</> : <><Eye className="h-3.5 w-3.5 mr-1" />Show me the whole thing</>}
                    </Button>
                    {isOpen && (
                      <div className="rounded-md border bg-muted/40">
                        <div className="flex items-center justify-between border-b px-3 py-1.5">
                          <span className="text-xs text-muted-foreground font-mono">the full send</span>
                          <CopyBtn text={card.fullEmail} />
                        </div>
                        <pre className="p-3 text-xs leading-relaxed whitespace-pre-wrap font-sans">{card.fullEmail}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

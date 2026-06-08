import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === "your-anthropic-api-key-here") {
    throw new Error("ANTHROPIC_API_KEY is not configured. Add it to your .env file.");
  }
  return new Anthropic({ apiKey: key });
}

const EmailInput = z.object({
  prospectName: z.string(),
  company: z.string(),
  title: z.string(),
  painPoint: z.string(),
  emailType: z.enum(["cold-outreach", "follow-up", "nurture", "re-engagement"]),
  tone: z.enum(["conversational", "direct", "consultative", "friendly"]),
  senderName: z.string().optional(),
});

const ResearchInput = z.object({
  company: z.string(),
  role: z.string(),
  context: z.string().optional(),
});

const GenuinenessInput = z.object({
  draft: z.string(),
  senderRole: z.string().optional(),
});

export const writeEmail = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof EmailInput>) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const client = getClient();

    const systemPrompt = `You are an elite B2B email copywriter who has studied thousands of high-performing cold emails and HubSpot's top-performing templates. You write emails that:
- Feel like they came from a real person, not a marketer
- Lead with a specific, relevant hook — not a compliment or generic opener
- Have ONE clear ask, never multiple CTAs
- Are under 150 words for cold outreach (follow-ups even shorter)
- Use "you" more than "I" or "we"
- Never start with "I hope this finds you well" or any variation
- Never use corporate jargon like "synergies," "circle back," "touch base"
- End with a low-friction, specific ask (not "let me know your thoughts")
- Have a subject line that creates curiosity or specificity — not clickbait`;

    const emailTypeGuide = {
      "cold-outreach": "First contact. Be concise, lead with their world not yours, one clear CTA.",
      "follow-up": "Reference the previous touchpoint. Add new value or a different angle. Even shorter.",
      "nurture": "Build trust over time. Share a relevant insight or resource. No hard sell.",
      "re-engagement": "Acknowledge the silence. Give them an easy out or a compelling reason to resurface.",
    };

    const userPrompt = `Write a ${data.emailType} email with these details:
- Prospect: ${data.prospectName}, ${data.title} at ${data.company}
- Their pain point / trigger: ${data.painPoint}
- Tone: ${data.tone}
- Sender: ${data.senderName || "the sender"}

Email type guidance: ${emailTypeGuide[data.emailType]}

Return ONLY this JSON (no markdown, no explanation):
{
  "subject": "the subject line",
  "body": "the full email body with line breaks as \\n",
  "whyItWorks": "2-3 sentences explaining the strategic choices made"
}`;

    const stream = await client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const message = await stream.finalMessage();
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

    try {
      return JSON.parse(textBlock.text) as {
        subject: string;
        body: string;
        whyItWorks: string;
      };
    } catch {
      return { subject: "", body: textBlock.text, whyItWorks: "" };
    }
  });

export const researchProspect = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof ResearchInput>) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const client = getClient();

    const userPrompt = `You are a sales intelligence researcher. Given a company and role, generate highly specific personalization angles for cold outreach.

Company: ${data.company}
Role/Title: ${data.role}
${data.context ? `Additional context: ${data.context}` : ""}

Based on what you know about this type of company and role, generate:

Return ONLY this JSON (no markdown, no explanation):
{
  "personalizationBullets": [
    "bullet 1 — specific angle or trigger to reference",
    "bullet 2",
    "bullet 3",
    "bullet 4",
    "bullet 5"
  ],
  "conversationStarters": [
    "starter 1 — a question or observation that shows you understand their world",
    "starter 2",
    "starter 3"
  ],
  "painPoints": [
    "common pain point 1 for this role/company type",
    "common pain point 2",
    "common pain point 3"
  ],
  "researchTips": "2-3 sentences on where to find live personalization data for this prospect (LinkedIn, company blog, news, etc.)"
}`;

    const stream = await client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const message = await stream.finalMessage();
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

    try {
      return JSON.parse(textBlock.text) as {
        personalizationBullets: string[];
        conversationStarters: string[];
        painPoints: string[];
        researchTips: string;
      };
    } catch {
      return {
        personalizationBullets: [],
        conversationStarters: [],
        painPoints: [],
        researchTips: textBlock.text,
      };
    }
  });

export const checkGenuineness = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof GenuinenessInput>) => GenuinenessInput.parse(d))
  .handler(async ({ data }) => {
    const client = getClient();

    const systemPrompt = `You are a brutally honest email coach who has reviewed thousands of B2B sales emails. You can instantly spot corporate speak, fake personalization, and templated fluff. You give direct, actionable feedback.`;

    const userPrompt = `Score this email draft for genuineness and effectiveness, then rewrite it to feel more real and human.

Email draft:
---
${data.draft}
---
${data.senderRole ? `Sender context: ${data.senderRole}` : ""}

Evaluate on these dimensions (score each 1-10):
- Genuineness: Does it sound like a real human wrote it?
- Personalization: Is it specific or could it go to 1000 people?
- Clarity: Is the ask clear and singular?
- Brevity: Is every word earning its place?

Return ONLY this JSON (no markdown, no explanation):
{
  "overallScore": 7,
  "scores": {
    "genuineness": 6,
    "personalization": 4,
    "clarity": 8,
    "brevity": 7
  },
  "redFlags": [
    "specific phrase or pattern that kills credibility",
    "another issue"
  ],
  "positives": [
    "what actually works in this email"
  ],
  "rewrite": "the full rewritten email (subject + body, separated by a blank line)",
  "rewriteNotes": "2-3 sentences explaining the key changes made and why"
}`;

    const stream = await client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const message = await stream.finalMessage();
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

    try {
      return JSON.parse(textBlock.text) as {
        overallScore: number;
        scores: {
          genuineness: number;
          personalization: number;
          clarity: number;
          brevity: number;
        };
        redFlags: string[];
        positives: string[];
        rewrite: string;
        rewriteNotes: string;
      };
    } catch {
      return {
        overallScore: 0,
        scores: { genuineness: 0, personalization: 0, clarity: 0, brevity: 0 },
        redFlags: [],
        positives: [],
        rewrite: textBlock.text,
        rewriteNotes: "",
      };
    }
  });

const FetchSkillInput = z.object({
  rawUrl: z.string().url(),
});

export const fetchSkillContent = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof FetchSkillInput>) => FetchSkillInput.parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(data.rawUrl, {
      headers: { Accept: "text/plain", "User-Agent": "Loopwise/1.0" },
    });
    if (!res.ok) throw new Error(`Failed to fetch skill (${res.status})`);
    const text = await res.text();
    return { content: text };
  });

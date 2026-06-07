import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.instantly.ai/api/v2";

function key() {
  const k = process.env.INSTANTLY_API_KEY;
  if (!k) throw new Error("INSTANTLY_API_KEY is not configured");
  return k;
}

async function call<T = any>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${key()}`, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Instantly ${res.status} on ${path}: ${text.slice(0, 200)}`);
  }
  return text ? JSON.parse(text) : ({} as T);
}

const DateRange = z.object({
  startDate: z.string(),
  endDate: z.string(),
  campaignId: z.string().optional(),
});

export const getCampaignsAnalytics = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof DateRange>) => DateRange.parse(d))
  .handler(async ({ data }) => {
    const json = await call<any>("/campaigns/analytics", {
      start_date: data.startDate,
      end_date: data.endDate,
      id: data.campaignId,
    });
    return Array.isArray(json) ? json : (json.items ?? []);
  });

export const getDailyAnalytics = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof DateRange>) => DateRange.parse(d))
  .handler(async ({ data }) => {
    const json = await call<any>("/campaigns/analytics/daily", {
      start_date: data.startDate,
      end_date: data.endDate,
      campaign_id: data.campaignId,
    });
    return Array.isArray(json) ? json : (json.items ?? []);
  });

export const getCampaignSteps = createServerFn({ method: "POST" })
  .inputValidator((d: { campaignId: string }) =>
    z.object({ campaignId: z.string() }).parse(d),
  )
  .handler(async ({ data }) => {
    const json = await call<any>("/campaigns/analytics/steps", { campaign_id: data.campaignId });
    return Array.isArray(json) ? json : (json.items ?? []);
  });

function classifyAsset(url: string): { kind: string; label: string } {
  const u = url.toLowerCase();
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "") || "/";
    if (/calendly|hubspot.*meeting|meetings\.|cal\.com|book-demo|book_a_demo|bookademo/.test(u))
      return { kind: "Booking link", label: `${host}${path}` };
    if (/\.pdf(\?|$)|playbook|whitepaper|white-paper|ebook|guide|datasheet|one-?pager/.test(u))
      return { kind: "Playbook / Asset", label: `${host}${path}` };
    if (/case-?study|case_study|customer-stor/.test(u))
      return { kind: "Case study", label: `${host}${path}` };
    if (/\/demo|request-demo|see-demo|product-tour/.test(u))
      return { kind: "Demo CTA", label: `${host}${path}` };
    if (/unsubscribe|preferences|opt-out/.test(u))
      return { kind: "Unsubscribe", label: `${host}${path}` };
    return { kind: "Landing page", label: `${host}${path}` };
  } catch {
    return { kind: "Other", label: url.slice(0, 80) };
  }
}

function extractUrls(html: string): string[] {
  if (!html) return [];
  const out = new Set<string>();
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("#")) continue;
    if (raw.includes("{{") || raw.includes("}}")) continue;
    // Normalize: strip query for grouping but keep full url for label
    try {
      const u = new URL(raw);
      const normalized = `${u.protocol}//${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "") || "/"}`;
      out.add(normalized);
    } catch {
      // skip malformed urls
    }
  }
  return Array.from(out);
}

export const getCampaignAssets = createServerFn({ method: "POST" })
  .inputValidator((d: { campaignIds: string[] }) =>
    z.object({ campaignIds: z.array(z.string()).max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.campaignIds.map(async (id) => {
        try {
          const c = await call<any>(`/campaigns/${id}`);
          const urls = new Set<string>();
          const sequences = c.sequences ?? [];
          for (const seq of sequences) {
            for (const step of seq.steps ?? []) {
              for (const v of step.variants ?? []) {
                for (const url of extractUrls(v.body ?? "")) urls.add(url);
              }
            }
          }
          const assets = Array.from(urls).map((url) => ({ url, ...classifyAsset(url) }));
          return { campaignId: id, assets };
        } catch {
          return { campaignId: id, assets: [] as { url: string; kind: string; label: string }[] };
        }
      }),
    );
    return results;
  });

export const listCampaigns = createServerFn({ method: "POST" }).handler(async () => {
  const json = await call<any>("/campaigns", { limit: "100" });
  return Array.isArray(json) ? json : (json.items ?? []);
});

export const listTags = createServerFn({ method: "POST" }).handler(async () => {
  const json = await call<any>("/custom-tags", { limit: "100" });
  const items = Array.isArray(json) ? json : (json.items ?? []);
  return items.map((t: any) => ({ id: t.id, label: t.label ?? "Untitled" }));
});

async function postJSON<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Instantly ${res.status} on ${path}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : ({} as T);
}

const OUTCOME_FILTERS = [
  { key: "interested", label: "Interested", filter: "FILTER_LEAD_INTERESTED" },
  { key: "meetingBooked", label: "Meeting Booked", filter: "FILTER_LEAD_MEETING_BOOKED" },
  { key: "meetingCompleted", label: "Meeting Completed", filter: "FILTER_LEAD_MEETING_COMPLETED" },
  { key: "closed", label: "Closed", filter: "FILTER_LEAD_CLOSED" },
] as const;

async function countLeads(campaign: string, filter: string, maxPages = 5): Promise<number> {
  let total = 0;
  let starting_after: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const body: any = { campaign, limit: 100, filter };
    if (starting_after) body.starting_after = starting_after;
    const res = await postJSON<any>("/leads/list", body);
    const items = res.items ?? [];
    total += items.length;
    starting_after = res.next_starting_after;
    if (!starting_after || items.length === 0) break;
  }
  return total;
}

async function fetchLeads(campaign: string, filter: string, maxPages = 5) {
  const leads: any[] = [];
  let starting_after: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const body: any = { campaign, limit: 100, filter };
    if (starting_after) body.starting_after = starting_after;
    const res = await postJSON<any>("/leads/list", body);
    const items = res.items ?? [];
    leads.push(...items);
    starting_after = res.next_starting_after;
    if (!starting_after || items.length === 0) break;
  }
  return leads;
}

export const getMeetingBookedAttribution = createServerFn({ method: "POST" })
  .inputValidator((d: { campaignIds: string[] }) =>
    z.object({ campaignIds: z.array(z.string()).max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.campaignIds.map(async (id) => {
        const leads = await fetchLeads(id, "FILTER_LEAD_MEETING_BOOKED").catch(() => []);
        return {
          campaignId: id,
          leads: leads.map((l: any) => ({
            id: l.id,
            email: l.email ?? "",
            firstName: l.first_name ?? "",
            lastName: l.last_name ?? "",
            company: l.company_name ?? "",
            timestampUpdated: l.timestamp_updated ?? l.timestamp_created ?? null,
            status: l.status ?? null,
            interestStatus: l.lt_interest_status ?? null,
          })),
        };
      }),
    );
    return results;
  });

export const getOpportunityBreakdown = createServerFn({ method: "POST" })
  .inputValidator((d: { campaignIds: string[] }) =>
    z.object({ campaignIds: z.array(z.string()).max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.campaignIds.map(async (id) => {
        const counts = await Promise.all(
          OUTCOME_FILTERS.map((o) => countLeads(id, o.filter).catch(() => 0)),
        );
        const breakdown: Record<string, number> = {};
        OUTCOME_FILTERS.forEach((o, i) => (breakdown[o.key] = counts[i]));
        return { campaignId: id, ...breakdown };
      }),
    );
    return results;
  });

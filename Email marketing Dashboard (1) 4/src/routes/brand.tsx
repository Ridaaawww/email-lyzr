import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/brand")({
  head: () => ({ meta: [{ title: "Brand Guidelines — Lyzr Email Marketing" }] }),
  component: BrandPage,
});

const COLORS = [
  {
    group: "Primary",
    swatches: [
      { name: "Deep Mahogany", hex: "#6B4C4C", usage: "CTAs, logo, active states", on: "#F9F5F1" },
      { name: "Warm Mauve", hex: "#8A6060", usage: "Hover states, secondary brand", on: "#F9F5F1" },
      { name: "Near Black", hex: "#160F0B", usage: "Dark mode background", on: "#F2EDE8" },
      { name: "Dark Espresso", hex: "#1E1610", usage: "Dark mode card surface", on: "#F2EDE8" },
    ],
  },
  {
    group: "Neutrals",
    swatches: [
      { name: "Warm Linen", hex: "#EBE5DC", usage: "Page background (60%)", on: "#2A1F1A" },
      { name: "Cream", hex: "#F2EDE8", usage: "Card surfaces, sidebar", on: "#2A1F1A" },
      { name: "Parchment", hex: "#F9F5F1", usage: "Popover, muted backgrounds", on: "#2A1F1A" },
      { name: "Warm Border", hex: "#D4CBC0", usage: "Borders, dividers, inputs", on: "#2A1F1A" },
    ],
  },
  {
    group: "Accents",
    swatches: [
      { name: "Dusty Rose", hex: "#C96A5A", usage: "CTA badge, accent highlights", on: "#F9F5F1" },
      { name: "Ink Deep", hex: "#2A1F1A", usage: "Body text, primary foreground", on: "#F9F5F1" },
      { name: "Warm Muted", hex: "#7A6A60", usage: "Subtext, captions, labels", on: "#F9F5F1" },
    ],
  },
  {
    group: "Functional",
    swatches: [
      { name: "Success", hex: "#16A34A", usage: "Positive metrics, deliverability", on: "#F9F5F1" },
      { name: "Warning", hex: "#D97706", usage: "Caution states", on: "#2A1F1A" },
      { name: "Error", hex: "#DC2626", usage: "Errors, failed sends", on: "#F9F5F1" },
      { name: "Info", hex: "#3B82F6", usage: "Informational states", on: "#F9F5F1" },
    ],
  },
];

const TYPE_SCALE = [
  { label: "Display", size: "36px", weight: "300", family: "Playfair Display", sample: "Email Marketing Intelligence" },
  { label: "H1", size: "30px", weight: "300", family: "Playfair Display", sample: "Campaign Performance Overview" },
  { label: "H2", size: "24px", weight: "300", family: "Playfair Display", sample: "Deliverability Health Score" },
  { label: "H3", size: "20px", weight: "300", family: "Playfair Display", sample: "Open Rate by Audience Segment" },
  { label: "Body", size: "15px", weight: "400", family: "DM Sans", sample: "Lyzr Email Marketing helps growth teams track deliverability, engagement, and campaign ROI in one place." },
  { label: "Label", size: "13px", weight: "500", family: "DM Sans", sample: "LAST 30 DAYS · FILTERED VIEW" },
  { label: "Caption", size: "12px", weight: "400", family: "DM Sans", sample: "Restricted to @lyzr.ai accounts only. Data refreshes every 15 minutes." },
];

const RADII = [
  { label: "sm", value: "8px", use: "Chips, tags, small inputs" },
  { label: "md", value: "10px", use: "Buttons, small cards" },
  { label: "lg", value: "14px", use: "Cards, panels, modals" },
  { label: "xl", value: "18px", use: "Large containers" },
  { label: "pill", value: "9999px", use: "CTA buttons, badges" },
];

const SHADOWS = [
  {
    label: "Resting",
    css: "0 4px 20px rgba(40,20,10,.07)",
    use: "Cards, sidebar",
  },
  {
    label: "Elevated",
    css: "0 8px 32px rgba(40,20,10,.10)",
    use: "Modals, dropdowns",
  },
  {
    label: "Brand CTA",
    css: "0 4px 20px rgba(107,76,76,.30)",
    use: "Primary mahogany buttons",
  },
];

function Swatch({ name, hex, usage, on }: { name: string; hex: string; usage: string; on: string }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#D4CBC0" }}>
      <div
        className="flex h-20 items-end px-3 pb-2.5"
        style={{ backgroundColor: hex }}
      >
        <span className="font-mono text-[11px] font-medium" style={{ color: on, opacity: 0.8 }}>
          {hex}
        </span>
      </div>
      <div className="px-3 py-2.5" style={{ backgroundColor: "#F9F5F1" }}>
        <p className="text-[13px] font-medium" style={{ color: "#2A1F1A", fontFamily: "'DM Sans', sans-serif" }}>
          {name}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
          {usage}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            color: "#2A1F1A",
            fontSize: "22px",
          }}
        >
          {title}
        </h2>
        <div className="h-px flex-1" style={{ backgroundColor: "#D4CBC0" }} />
      </div>
      {children}
    </section>
  );
}

function BrandPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl px-10 py-14" style={{ backgroundColor: "#6B4C4C", boxShadow: "0 8px 32px rgba(40,20,10,.18)" }}>
        <div className="relative z-10">
          <div
            className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest"
            style={{ backgroundColor: "rgba(201,106,90,.25)", color: "#F2C4BC", fontFamily: "'DM Sans', sans-serif" }}
          >
            Brand Identity
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              letterSpacing: "-0.04em",
              color: "#F9F5F1",
              fontSize: "42px",
              lineHeight: 1.1,
            }}
          >
            Lyzr Brand Guidelines
          </h1>
          <p
            className="mt-3 max-w-lg text-base leading-relaxed"
            style={{ color: "rgba(249,245,241,.70)", fontFamily: "'DM Sans', sans-serif" }}
          >
            The visual language behind Lyzr — warm, grounded, and intelligent. Use these tokens to build consistent experiences across every surface.
          </p>
          <div className="mt-6 flex gap-6 text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(249,245,241,.55)" }}>
            <span>60% Neutrals</span>
            <span>·</span>
            <span>30% Brand</span>
            <span>·</span>
            <span>10% Accents</span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10" style={{ backgroundColor: "#C96A5A" }} />
        <div className="absolute -bottom-20 right-32 h-48 w-48 rounded-full opacity-8" style={{ backgroundColor: "#F9F5F1" }} />
      </div>

      {/* Logo mark */}
      <Section title="Logo Mark">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: "#F2EDE8", borderColor: "#D4CBC0", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
        >
          <div className="flex flex-wrap items-center gap-10">
            {/* On light */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: "#6B4C4C", color: "#F9F5F1", fontFamily: "'Playfair Display', serif", fontWeight: 400, boxShadow: "0 8px 32px rgba(40,20,10,.18)" }}>
                L
              </div>
              <span className="text-[11px]" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>On light</span>
            </div>
            {/* On dark */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: "#160F0B", color: "#C96A5A", fontFamily: "'Playfair Display', serif", fontWeight: 400, boxShadow: "0 8px 32px rgba(40,20,10,.30)" }}>
                L
              </div>
              <span className="text-[11px]" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>On dark</span>
            </div>
            {/* Wordmark */}
            <div className="flex flex-col gap-1.5">
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: "24px", color: "#2A1F1A", letterSpacing: "-0.03em" }}>
                Lyzr Email Marketing
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#7A6A60", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Growth Intelligence
              </span>
            </div>
          </div>
          <div className="mt-6 rounded-xl p-4 text-sm" style={{ backgroundColor: "rgba(107,76,76,.06)", fontFamily: "'DM Sans', sans-serif", color: "#7A6A60" }}>
            <strong style={{ color: "#6B4C4C" }}>Usage rule:</strong> Always use the "L" mark on a rounded square container. Never stretch, recolor outside the palette, or place on mid-tone backgrounds without contrast testing.
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section title="Color System">
        <div className="space-y-8">
          {COLORS.map((group) => (
            <div key={group.group}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                {group.group}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {group.swatches.map((s) => (
                  <Swatch key={s.hex} {...s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "#D4CBC0", backgroundColor: "#F2EDE8", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
        >
          {/* Font families */}
          <div className="grid grid-cols-2 divide-x border-b" style={{ borderColor: "#D4CBC0" }}>
            <div className="p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                Brand / Headings
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 300, letterSpacing: "-0.03em", color: "#2A1F1A" }}>
                Playfair Display
              </p>
              <p className="mt-1 text-xs" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                Weight 300 Light · Tracking −0.03em · Serif
              </p>
            </div>
            <div className="p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                UI / Body / Labels
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "28px", fontWeight: 400, color: "#2A1F1A" }}>
                DM Sans
              </p>
              <p className="mt-1 text-xs" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                Weight 300–700 · Tracking 0 · Sans-serif
              </p>
            </div>
          </div>
          {/* Scale */}
          <div className="divide-y" style={{ borderColor: "#D4CBC0" }}>
            {TYPE_SCALE.map((t) => (
              <div key={t.label} className="flex items-baseline gap-6 px-6 py-4">
                <div className="w-16 shrink-0">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: "rgba(107,76,76,.08)", color: "#6B4C4C", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {t.label}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: `'${t.family}', ${t.family.includes("Playfair") ? "serif" : "sans-serif"}`,
                    fontSize: t.size,
                    fontWeight: t.weight,
                    color: "#2A1F1A",
                    letterSpacing: t.family.includes("Playfair") ? "-0.03em" : undefined,
                    lineHeight: 1.3,
                  }}
                >
                  {t.sample}
                </p>
                <span
                  className="ml-auto shrink-0 text-[11px]"
                  style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t.size} / {t.weight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Components */}
      <Section title="Components">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: "#F2EDE8", borderColor: "#D4CBC0", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
        >
          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                Buttons
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="rounded-full px-5 py-2.5 text-sm font-medium"
                  style={{ backgroundColor: "#6B4C4C", color: "#F9F5F1", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(107,76,76,.30)", letterSpacing: "0.01em" }}
                >
                  Primary CTA
                </button>
                <button
                  className="rounded-full px-5 py-2.5 text-sm font-medium"
                  style={{ backgroundColor: "#C96A5A", color: "#F9F5F1", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
                >
                  Accent CTA
                </button>
                <button
                  className="rounded-full border px-5 py-2.5 text-sm font-medium"
                  style={{ borderColor: "#D4CBC0", backgroundColor: "transparent", color: "#2A1F1A", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Outlined
                </button>
                <button
                  className="rounded-full px-5 py-2.5 text-sm font-medium"
                  style={{ backgroundColor: "#F9F5F1", color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Ghost
                </button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                Badges & Tags
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Brand", bg: "rgba(107,76,76,.10)", color: "#6B4C4C" },
                  { label: "Accent", bg: "rgba(201,106,90,.12)", color: "#C96A5A" },
                  { label: "Success", bg: "rgba(22,163,74,.10)", color: "#16A34A" },
                  { label: "Warning", bg: "rgba(217,119,6,.10)", color: "#D97706" },
                  { label: "Error", bg: "rgba(220,38,38,.10)", color: "#DC2626" },
                  { label: "Info", bg: "rgba(59,130,246,.10)", color: "#3B82F6" },
                  { label: "Neutral", bg: "#EBE5DC", color: "#7A6A60" },
                ].map((b) => (
                  <span
                    key={b.label}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: b.bg, color: b.color, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                KPI Card
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "OPEN RATE", value: "42.8%", delta: "+3.2%", positive: true },
                  { label: "REPLY RATE", value: "6.1%", delta: "+0.8%", positive: true },
                  { label: "BOUNCE RATE", value: "1.4%", delta: "+0.3%", positive: false },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "#F9F5F1", border: "1px solid #D4CBC0", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>
                      {k.label}
                    </p>
                    <p className="mt-2 text-2xl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, color: "#2A1F1A", letterSpacing: "-0.03em" }}>
                      {k.value}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: k.positive ? "#16A34A" : "#DC2626", fontFamily: "'DM Sans', sans-serif" }}>
                      {k.delta} vs prev period
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Spacing & Radius */}
      <Section title="Border Radius">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: "#F2EDE8", borderColor: "#D4CBC0", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
        >
          <div className="flex flex-wrap items-end gap-6">
            {RADII.map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-3">
                <div
                  className="border"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: r.value,
                    backgroundColor: "rgba(107,76,76,.10)",
                    borderColor: "#6B4C4C",
                  }}
                />
                <div className="text-center">
                  <p className="text-xs font-semibold" style={{ color: "#2A1F1A", fontFamily: "'DM Sans', sans-serif" }}>
                    {r.label}
                  </p>
                  <p className="font-mono text-[11px]" style={{ color: "#7A6A60" }}>{r.value}</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>{r.use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Shadows */}
      <Section title="Elevation & Shadows">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SHADOWS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-6"
              style={{
                backgroundColor: "#F9F5F1",
                border: "1px solid #D4CBC0",
                boxShadow: s.css,
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "#2A1F1A", fontFamily: "'DM Sans', sans-serif" }}>
                {s.label}
              </p>
              <p className="mt-1 font-mono text-[10px] break-all" style={{ color: "#7A6A60" }}>{s.css}</p>
              <p className="mt-2 text-[11px]" style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}>{s.use}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Do / Don't */}
      <Section title="Usage Rules">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "rgba(22,163,74,.04)", borderColor: "rgba(22,163,74,.25)", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "#16A34A", fontFamily: "'DM Sans', sans-serif" }}>
              ✓ Do
            </p>
            <ul className="space-y-2.5 text-sm" style={{ color: "#2A1F1A", fontFamily: "'DM Sans', sans-serif" }}>
              <li>Use Playfair Display at weight 300 for all headings</li>
              <li>Apply the 60–30–10 rule: neutrals dominate, mahogany anchors, accents highlight</li>
              <li>Use pill corners (9999px) on all CTA buttons</li>
              <li>Maintain warm linen (#EBE5DC) as the base page background</li>
              <li>Use the resting shadow on cards, elevated shadow on modals</li>
              <li>Keep badge labels uppercase in DM Sans 500</li>
            </ul>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "rgba(220,38,38,.04)", borderColor: "rgba(220,38,38,.20)", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "#DC2626", fontFamily: "'DM Sans', sans-serif" }}>
              ✗ Don't
            </p>
            <ul className="space-y-2.5 text-sm" style={{ color: "#2A1F1A", fontFamily: "'DM Sans', sans-serif" }}>
              <li>Never use Playfair Display at weight 700 (bold) — it fights the elegance</li>
              <li>Don't place the mahogany "L" mark on mid-tone brown surfaces without a white/parchment container</li>
              <li>Avoid sharp square corners on buttons (radius must be ≥ 8px)</li>
              <li>Don't use pure white (#FFF) as the page background — use Warm Linen</li>
              <li>Don't mix functional alert colors (red/green) with brand accents in the same UI region</li>
              <li>Never use Dusty Rose as a text color on Cream — insufficient contrast</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Tokens reference */}
      <Section title="CSS Tokens">
        <div
          className="overflow-x-auto rounded-2xl border"
          style={{ backgroundColor: "#F2EDE8", borderColor: "#D4CBC0", boxShadow: "0 4px 20px rgba(40,20,10,.07)" }}
        >
          <table className="w-full text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #D4CBC0" }}>
                {["Token", "Light", "Dark", "Purpose"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#7A6A60" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["--background", "#EBE5DC", "#160F0B", "Page background"],
                ["--foreground", "#2A1F1A", "#F2EDE8", "Primary text"],
                ["--card", "#F2EDE8", "#1E1610", "Card surface"],
                ["--primary", "#6B4C4C", "#C96A5A", "Brand CTA"],
                ["--primary-foreground", "#F9F5F1", "#160F0B", "Text on primary"],
                ["--accent", "#C96A5A", "#C96A5A", "Dusty Rose accent"],
                ["--muted-foreground", "#7A6A60", "#9B8A82", "Subtext"],
                ["--border", "#D4CBC0", "rgba(255,255,255,.07)", "All borders"],
                ["--sidebar", "#EBE5DC", "#1E1610", "Sidebar background"],
              ].map(([token, light, dark, purpose], i) => (
                <tr key={token} style={{ borderBottom: i < 8 ? "1px solid #D4CBC0" : undefined }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#6B4C4C" }}>{token}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: light, border: "1px solid #D4CBC0" }} />
                      <span className="font-mono text-xs" style={{ color: "#2A1F1A" }}>{light}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: dark === "rgba(255,255,255,.07)" ? "#ffffff12" : dark, border: "1px solid #D4CBC0" }} />
                      <span className="font-mono text-xs" style={{ color: "#2A1F1A" }}>{dark}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#7A6A60" }}>{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

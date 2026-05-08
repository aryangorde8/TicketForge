import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Lock, Play } from "lucide-react";
import { Atmosphere, useMagnet, useReveal } from "@/components/atmosphere";
import { Meta } from "@/components/meta";
import { SiteHeader } from "@/components/site-header";

const MARQUEE_ITEMS = [
  { name: "Linear" },
  { name: "Slack" },
  { name: "Zoom" },
  { name: "Google Meet" },
  { name: "Otter.ai" },
  { name: "Notion" },
  { name: "GitHub" },
  { name: "Loom" },
];

export default function Home() {
  useReveal();
  useMagnet();
  useStatCount();
  useHeroAnimation();

  const today = new Date();
  const dateStr = today
    .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <>
      <Meta path="/" />
      <SiteHeader variant="marketing" />

      {/* ISSUE STRIP */}
      <div className="mx-auto max-w-[1320px] px-7">
        <div className="issue-strip">
          <span className="issue-cell">
            <span className="pip" />
            ISSUE NO. 05
          </span>
          <span className="issue-cell hidden sm:inline-flex">
            VOLUME I — ENGINEERING TOOLS
          </span>
          <span className="issue-cell hidden md:inline-flex">{dateStr}</span>
          <span className="issue-cell">
            FILED BY <span style={{ color: "var(--vermillion)", fontWeight: 600 }}>FORGE</span>
          </span>
        </div>
      </div>

      {/* HERO */}
      <section style={{ position: "relative", padding: "72px 0 80px" }}>
        <Atmosphere withCursorGlow />
        <span className="section-num" style={{ left: "-2vw", top: "10%" }}>
          01
        </span>

        <div className="relative z-[2] mx-auto max-w-[1320px] px-7">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="reveal">
              <div className="margin-note mb-8">
                A FIELD MANUAL FOR&nbsp;ENGINEERING TEAMS WHO MEET TOO MUCH.
              </div>

              <h1 className="display display-xl">
                Turn meetings
                <br />
                <span style={{ color: "var(--vermillion)" }}>into</span>{" "}
                <span className="ital">tickets</span>.
                <br />
                <span style={{ color: "var(--muted)", fontWeight: 300, fontStyle: "italic" }}>
                  In&nbsp;seconds.
                </span>
              </h1>

              <div
                className="mt-10 grid gap-x-12 gap-y-6 lg:grid-cols-2"
                style={{ maxWidth: 760 }}
              >
                <p className="lede">
                  TicketForge converts meeting transcripts into properly-structured Linear, GitHub,
                  and Notion tickets — with confidence-scored action items, smart assignee matching,
                  and human review built in.
                </p>
                <div>
                  <div className="margin-note mb-3">WHAT YOU&apos;LL FIND INSIDE</div>
                  <ul
                    className="list-none space-y-1.5 p-0 text-sm"
                    style={{ color: "var(--ink-2)" }}
                  >
                    <ListItem num="i.">Confidence-scored extraction with source quotes</ListItem>
                    <ListItem num="ii.">Stalled-commitment radar across prior meetings</ListItem>
                    <ListItem num="iii.">Linear · GitHub · Notion · Slack · MCP</ListItem>
                  </ul>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/extract?sample=1" className="btn btn-primary btn-lg magnet">
                  <Play className="h-3 w-3 fill-current" />
                  Try with sample
                </Link>
                <Link href="/extract" className="btn btn-secondary btn-lg magnet">
                  Paste your own
                  <span className="kbd">⌘V</span>
                </Link>
                <span
                  className="ml-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  No login req&apos;d
                </span>
              </div>
            </div>

            {/* Right rail: edition info */}
            <div className="reveal hidden lg:block">
              <div
                style={{
                  borderLeft: "1px solid var(--ink)",
                  paddingLeft: 20,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  lineHeight: 1.9,
                }}
              >
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: "var(--muted)" }}>EDITION</div>
                  <div className="serif-italic" style={{ fontSize: 32, textTransform: "none", letterSpacing: "-0.02em" }}>v0.5</div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: "var(--muted)" }}>STACK</div>
                  <div>Next.js · Groq · Llama 3.3</div>
                  <div>Whisper · Linear SDK</div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: "var(--muted)" }}>SHIPPED</div>
                  <div>Voice → Tickets pipeline</div>
                  <div>Stalled commitments</div>
                  <div>Slack bot · MCP server</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)" }}>STATUS</div>
                  <div className="inline-flex items-center gap-2">
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        background: "var(--vermillion)",
                        display: "inline-block",
                      }}
                    />
                    LIVE — TICKETFORGE.ARYANGORDE.COM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero browser mock */}
          <HeroMock />

          {/* Marquee */}
          <div className="reveal" style={{ marginTop: 80 }}>
            <div className="hard-rule">
              <span className="num">004</span>
              <span>BUILT FOR TEAMS USING</span>
              <span className="spacer" />
              <span style={{ color: "var(--muted)" }}>SUPPORTED INTEGRATIONS</span>
            </div>
            <div className="marquee" style={{ marginTop: 18 }}>
              <div className="marquee-track">
                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((it, i) => (
                  <div key={`${it.name}-${i}`} className="marquee-item">
                    <span
                      className="serif-italic"
                      style={{
                        fontSize: 26,
                        color: i % 4 === 0 ? "var(--vermillion)" : "var(--ink)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {it.name}
                    </span>
                    <span style={{ color: "var(--muted-2)" }}>—</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ position: "relative", padding: "120px 0 96px" }}>
        <span className="section-num" style={{ right: "-2vw", top: "5%" }}>
          02
        </span>
        <div className="relative z-[2] mx-auto max-w-[1320px] px-7">
          <div className="hard-rule reveal">
            <span className="num">II</span>
            <span>How it works</span>
            <span className="spacer" />
            <span style={{ color: "var(--muted)" }}>3 STAGES, 1 SOURCE OF TRUTH</span>
          </div>

          <div className="reveal mt-10 grid gap-12 lg:grid-cols-[1fr_2fr]">
            <h2 className="section-title">
              A pipeline you can <span className="ital" style={{ color: "var(--vermillion)" }}>actually</span> trust.
            </h2>
            <p className="body-text" style={{ maxWidth: 540, fontSize: 17 }}>
              Three stages, one source of truth. Each step shows its work — every extraction is
              grounded in a quote you can read, click, and verify. <span className="serif-italic" style={{ color: "var(--ink)", fontSize: 19 }}>No hallucinations.</span>
            </p>
          </div>

          <div className="reveal mt-14 grid gap-0 md:grid-cols-3" style={{ borderTop: "1px solid var(--ink)", borderLeft: "1px solid var(--ink)" }}>
            <FeatureBlock
              num="01"
              title="Extract with confidence"
              body="Confidence-scored items with the source quote attached to every extraction. The model shows its receipts."
              footer={
                <>
                  <span className="conf conf-hi" style={{ borderColor: "currentColor" }}>0.94</span>
                  <span className="serif-italic truncate" style={{ color: "var(--muted)", fontSize: 14 }}>
                    &ldquo;Aryan, take Stripe — it&apos;s blocking checkout.&rdquo;
                  </span>
                </>
              }
            />
            <FeatureBlock
              num="02"
              title="Smart assignee match"
              body="Fuzzy-matches transcript names — first names, nicknames, typos — to your Linear team. ~95% accuracy on real meetings."
              footer={
                <>
                  <span className="mono text-[11px]" style={{ color: "var(--muted)" }}>&ldquo;marcus&rdquo;</span>
                  <ArrowRight className="h-3 w-3" style={{ color: "var(--muted-2)" }} />
                  <span style={{ color: "var(--ink)", fontWeight: 500, fontSize: 13 }}>Marcus Chen</span>
                  <span className="ml-auto mono" style={{ color: "var(--vermillion)", fontWeight: 600, fontSize: 11 }}>88%</span>
                </>
              }
            />
            <FeatureBlock
              num="03"
              title="Review before push"
              body="Bulk actions, inline edits, source-of-truth quotes. No surprises in your board. The human stays in the loop."
              footer={
                <>
                  <span className="pill" style={{ borderColor: "var(--ink)" }}>Bulk priority</span>
                  <span className="pill" style={{ borderColor: "var(--ink)" }}>Reassign</span>
                  <span className="pill" style={{ borderColor: "var(--ink)" }}>Skip</span>
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" style={{ position: "relative", padding: "96px 0" }}>
        <span className="section-num" style={{ left: "-2vw", top: "10%" }}>
          03
        </span>
        <div className="relative z-[2] mx-auto max-w-[1320px] px-7">
          <div className="hard-rule reveal">
            <span className="num">III</span>
            <span>The math</span>
            <span className="spacer" />
            <span style={{ color: "var(--muted)" }}>BUSINESS IMPACT — VERIFIED</span>
          </div>

          <div className="reveal mt-12">
            <h2 className="display display-lg" style={{ maxWidth: 900 }}>
              Save{" "}
              <span style={{ color: "var(--vermillion)" }} className="ital">
                $130K
              </span>{" "}
              <span style={{ color: "var(--muted)", fontWeight: 300, fontStyle: "italic" }}>per year on a</span>{" "}
              20-person team.
            </h2>
          </div>

          <div className="reveal mt-12 grid grid-cols-2 gap-0 md:grid-cols-4" style={{ borderTop: "1px solid var(--ink)" }}>
            <StatBlock count={6} suffix="hrs/wk" body="PM time on manual ticket conversion." />
            <StatBlock count={95} suffix="%" body="Reduction in that overhead with TicketForge." accent />
            <StatBlock count={10} suffix="min" body="Average time per meeting end-to-end." />
            <StatBlock count={142} suffix="K" body="Tickets created across teams using TicketForge." />
          </div>

          <p className="body-text reveal mt-12" style={{ maxWidth: 720, fontSize: 16 }}>
            Engineering managers spend 4–6 hours per week converting meeting notes into tickets.
            For a 20-person product + engineering team at an average loaded cost of $90K/year,
            that&apos;s{" "}
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>$144K/year</span> in lost
            capacity. TicketForge reduces this to ~10 minutes per meeting.
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function ListItem({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className="mono shrink-0"
        style={{
          color: "var(--vermillion)",
          fontSize: 11,
          fontWeight: 600,
          marginTop: 4,
        }}
      >
        {num}
      </span>
      <span>{children}</span>
    </li>
  );
}

function FeatureBlock({
  num,
  title,
  body,
  footer,
}: {
  num: string;
  title: string;
  body: string;
  footer: React.ReactNode;
}) {
  return (
    <div
      className="hoverable transition-colors"
      style={{
        padding: 32,
        borderRight: "1px solid var(--ink)",
        borderBottom: "1px solid var(--ink)",
      }}
    >
      <div className="flex items-baseline justify-between">
        <span
          className="mono"
          style={{
            color: "var(--vermillion)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {num}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--muted-2)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          stage {num}
        </span>
      </div>
      <h3
        className="display"
        style={{
          fontSize: 28,
          marginTop: 24,
          letterSpacing: "-0.025em",
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      <p
        className="body-text mt-3"
        style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}
      >
        {body}
      </p>
      <div
        className="mt-6 flex items-center gap-2 pt-5 text-xs"
        style={{ borderTop: "1px dashed var(--line-2)" }}
      >
        {footer}
      </div>
    </div>
  );
}

function StatBlock({
  count,
  suffix,
  body,
  accent,
}: {
  count: number;
  suffix: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: "32px 24px",
        borderRight: "1px solid var(--ink)",
        borderBottom: "1px solid var(--ink)",
        background: accent ? "var(--ink)" : "transparent",
        color: accent ? "var(--bg)" : "var(--ink)",
        position: "relative",
      }}
    >
      <div
        className="stat-num"
        data-count={count}
        data-suffix={suffix}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(48px, 6vw, 84px)",
          fontWeight: 500,
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          color: accent ? "var(--bg)" : "var(--ink)",
        }}
      >
        0
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            fontWeight: 500,
            marginLeft: 6,
            opacity: 0.7,
            verticalAlign: "top",
          }}
        >
          {suffix}
        </span>
      </div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          marginTop: 18,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          opacity: 0.7,
          lineHeight: 1.5,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function HeroMock() {
  return (
    <div
      className="reveal"
      style={{
        position: "relative",
        marginTop: 56,
        border: "1px solid var(--ink)",
        background: "var(--bg-elev)",
        boxShadow: "10px 10px 0 0 var(--ink)",
      }}
    >
      <div
        className="flex h-10 items-center gap-2 px-4"
        style={{
          borderBottom: "1px solid var(--ink)",
          background: "var(--ink)",
          color: "var(--bg)",
        }}
      >
        <span style={{ width: 9, height: 9, background: "var(--vermillion)" }} />
        <span style={{ width: 9, height: 9, background: "var(--bg)", border: "1px solid var(--bg)" }} />
        <span style={{ width: 9, height: 9, background: "transparent", border: "1px solid var(--bg)" }} />
        <span
          className="ml-3 mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider"
          style={{ color: "var(--bg)" }}
        >
          <Lock className="h-3 w-3" />
          ticketforge.app/extract
        </span>
        <div
          className="ml-auto mono inline-flex items-center gap-2 text-[10px] uppercase"
          style={{ letterSpacing: "0.12em" }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              background: "var(--vermillion)",
              borderRadius: "50%",
              animation: "pulseForge 1.6s ease infinite",
            }}
          />
          <span id="hero-status-label">Listening…</span>
        </div>
      </div>
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div
          className="px-7 py-6"
          style={{ borderRight: "1px solid var(--ink)" }}
        >
          <div
            className="mono mb-4"
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--muted)",
            }}
          >
            <span style={{ color: "var(--vermillion)" }}>—</span>{" "}
            Transcript · Eng sync · Tue 10:00
          </div>
          <div id="hero-transcript" style={{ minHeight: 260 }} />
        </div>
        <div className="px-6 py-5">
          <div
            className="mb-4 flex items-center justify-between"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--muted)",
            }}
          >
            <span>
              <span style={{ color: "var(--vermillion)" }}>—</span> Extracted action items
            </span>
            <span id="hero-count" style={{ color: "var(--ink)" }}>0 / 4</span>
          </div>
          <div id="hero-items" />
        </div>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ borderTop: "1px solid var(--ink)" }}
    >
      <Atmosphere opacity={0.25} withDotgrid={false} />
      <div className="relative mx-auto max-w-[1320px] px-7 pt-20">
        <div className="hard-rule">
          <span className="num">∞</span>
          <span>Index</span>
          <span className="spacer" />
          <span style={{ color: "var(--muted)" }}>FILED 2026</span>
        </div>

        <div className="grid gap-10 mt-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="reveal">
            <Link
              href="/"
              className="serif-italic inline-block"
              style={{ fontSize: 36, letterSpacing: "-0.02em", color: "var(--ink)" }}
            >
              TicketForge
            </Link>
            <p
              className="body-text mt-3"
              style={{ maxWidth: 380, fontSize: 14 }}
            >
              Meetings → tickets, in seconds. No more transcription archaeology on Friday afternoon.
            </p>
            <div className="mt-6" style={{ maxWidth: 380 }}>
              <div className="margin-note mb-2.5">SUBSCRIBE</div>
              <form
                className="flex"
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const input = target.querySelector("input") as HTMLInputElement | null;
                  const btn = target.querySelector("button span") as HTMLSpanElement | null;
                  if (input) input.value = "";
                  if (btn) btn.textContent = "✓ ON THE LIST";
                }}
              >
                <input
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="flex-1 px-3 outline-none"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--ink)",
                    borderRight: "none",
                    color: "var(--ink)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    height: 42,
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: 0, boxShadow: "none", height: 42 }}
                >
                  <span>Subscribe</span>
                </button>
              </form>
            </div>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: "Extract", href: "/extract" },
              { label: "Review", href: "/review" },
              { label: "Integrations", href: "/how-it-works" },
              { label: "Impact", href: "/impact" },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { label: "How it works", href: "/how-it-works" },
              { label: "GitHub", href: "https://github.com/aryangorde8/TicketForge" },
              { label: "MCP server", href: "/how-it-works" },
              { label: "Status", href: "#" },
            ]}
          />
          <FooterCol
            title="The fine print"
            links={[
              { label: "Devpost", href: "#" },
              { label: "Hackathon", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ]}
          />
        </div>

        <div
          className="mt-16 flex flex-wrap items-center justify-between gap-3 py-5"
          style={{
            borderTop: "1px solid var(--ink)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--ink)",
          }}
        >
          <div>© 2026 — Internal Tools Hacks submission</div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/aryangorde8/TicketForge">GitHub →</a>
          </div>
        </div>

        <div className="reveal relative overflow-hidden pb-2 mt-4">
          <div className="word-huge">TicketForge</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="reveal">
      <div className="margin-note mb-4">{title}</div>
      <ul
        className="m-0 flex list-none flex-col gap-2.5 p-0"
        style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)" }}
      >
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:opacity-60">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useStatCount() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>(".stat-num[data-count]");
    if (els.length === 0) return;
    if (reduce) {
      els.forEach((el) => {
        const target = parseFloat(el.dataset.count ?? "0");
        const unit = el.children[0]?.outerHTML ?? "";
        el.innerHTML = String(target) + unit;
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = parseFloat(el.dataset.count ?? "0");
          const unitNode = el.children[0]?.outerHTML ?? "";
          const t0 = performance.now();
          const dur = 1400;
          function step(now: number) {
            const t = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            const v = Math.round(target * eased);
            el.innerHTML = v + unitNode;
            if (t < 1) requestAnimationFrame(step);
            else el.innerHTML = String(target) + unitNode;
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useHeroAnimation() {
  const startedRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transcriptEl = document.getElementById("hero-transcript");
    const itemsEl = document.getElementById("hero-items");
    const countEl = document.getElementById("hero-count");
    const statusLabel = document.getElementById("hero-status-label");
    if (!transcriptEl || !itemsEl) return;

    const lines = [
      { speaker: "Marcus", text: "Aryan, the Stripe gateway is timing out — 5% of checkouts yesterday. Make it urgent." },
      { speaker: "Aryan", text: "On it tomorrow. Likely the retry config we shipped Friday." },
      { speaker: "Priya", text: "Also we need to send the v1 API deprecation notice this week — 30-day window." },
      { speaker: "Marcus", text: "I'll take the OAuth2 migration next sprint. Onboarding emails need a compliance pass before Friday." },
    ];

    const items = [
      { title: "Investigate Stripe payment gateway timeout", who: "AG", whoName: "Aryan", priority: "urgent", conf: 0.94 },
      { title: "Send v1 API deprecation notice", who: "PS", whoName: "Priya", priority: "med", conf: 0.82 },
      { title: "Migrate auth service to OAuth2", who: "MC", whoName: "Marcus", priority: "high", conf: 0.91 },
      { title: "Compliance review of onboarding emails", who: "MC", whoName: "Marcus", priority: "high", conf: 0.89 },
    ];

    function priorityPill(p: string) {
      const map: Record<string, [string, string]> = {
        urgent: ["#E64A19", "Urgent"],
        high: ["#F97316", "High"],
        med: ["#0EA5E9", "Med"],
        low: ["#71717A", "Low"],
      };
      const [color, label] = map[p];
      return `<span class="pill mono" style="color:${color};border-color:${color};font-size:9.5px;padding:2px 6px;">${label}</span>`;
    }
    function confPill(c: number) {
      const color = c >= 0.85 ? "#047857" : c >= 0.7 ? "#B45309" : "#B45309";
      return `<span class="conf mono" style="color:${color};border:1px solid ${color};border-radius:0;font-size:11px;font-weight:600;padding:2px 6px;">${c.toFixed(2)}</span>`;
    }

    function renderItems(n: number) {
      let html = "";
      items.forEach((it, i) => {
        const visible = i < n;
        html += `<div style="display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--ink);margin-bottom:8px;background:var(--bg-elev);opacity:${visible ? 1 : 0};transform:${visible ? "none" : "translateY(8px)"};transition:opacity .5s cubic-bezier(.2,.8,.2,1),transform .5s cubic-bezier(.2,.8,.2,1);transition-delay:${i * 60}ms;">
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--ink);letter-spacing:-0.005em;">${it.title}</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--muted);margin-top:4px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;text-transform:uppercase;letter-spacing:0.08em;"><span style="color:var(--vermillion);">${it.who}</span> ${it.whoName} ${priorityPill(it.priority)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">${confPill(it.conf)}</div>
        </div>`;
      });
      itemsEl!.innerHTML = html;
    }

    if (reduce) {
      transcriptEl.innerHTML = lines
        .map(
          (l) =>
            `<span style="display:block;font-family:var(--font-mono);font-size:12.5px;line-height:1.85;color:var(--ink-2);"><span style="color:var(--vermillion);font-weight:600;">${l.speaker}:</span> ${l.text}</span>`
        )
        .join("");
      renderItems(items.length);
      if (countEl) countEl.textContent = `${items.length} / ${items.length}`;
      if (statusLabel) statusLabel.textContent = "Done";
      return;
    }

    if (startedRef.current) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    async function runLoop() {
      while (!cancelled) {
        transcriptEl!.innerHTML = "";
        renderItems(0);
        if (countEl) countEl.textContent = "0 / 4";
        if (statusLabel) statusLabel.textContent = "Listening…";

        for (const line of lines) {
          if (cancelled) return;
          const wrap = document.createElement("span");
          wrap.style.cssText =
            "display:block;font-family:var(--font-mono);font-size:12.5px;line-height:1.85;color:var(--ink-2);";
          wrap.innerHTML = `<span style="color:var(--vermillion);font-weight:600;">${line.speaker}:</span> `;
          const textNode = document.createElement("span");
          wrap.appendChild(textNode);
          const caret = document.createElement("span");
          caret.style.cssText =
            "display:inline-block;width:7px;height:14px;background:var(--vermillion);transform:translateY(2px);margin-left:1px;animation:blink 1s steps(1) infinite;";
          wrap.appendChild(caret);
          transcriptEl!.appendChild(wrap);

          for (let i = 0; i < line.text.length && !cancelled; i++) {
            textNode.textContent += line.text[i];
            await sleep(8 + Math.random() * 14);
          }
          wrap.removeChild(caret);
          await sleep(180);
        }

        if (statusLabel) statusLabel.textContent = "Extracting…";
        await sleep(400);

        for (let i = 1; i <= items.length && !cancelled; i++) {
          renderItems(i);
          if (countEl) countEl.textContent = `${i} / 4`;
          await sleep(360);
        }

        if (statusLabel) statusLabel.textContent = "Ready to push";
        await sleep(3500);
      }
    }

    const browser = transcriptEl.closest("[style*='boxShadow']") || transcriptEl.parentElement;
    if (browser) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && !startedRef.current) {
              startedRef.current = true;
              runLoop();
              io.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      io.observe(browser);
    } else {
      startedRef.current = true;
      runLoop();
    }

    return () => {
      cancelled = true;
    };
  }, []);
}

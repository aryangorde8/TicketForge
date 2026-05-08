import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  ExternalLink,
  Lock,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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

  return (
    <>
      <Meta path="/" />
      <SiteHeader variant="marketing" />

      {/* HERO */}
      <section style={{ position: "relative", padding: "96px 0 64px" }}>
        <Atmosphere withCursorGlow />
        <div className="relative z-[2] mx-auto max-w-[1200px] px-7">
          <div className="reveal" style={{ maxWidth: 800 }}>
            <span className="badge-live">
              <span className="dot-live" />
              Now with confidence-scored extraction
              <span style={{ color: "var(--muted-2)" }}>·</span>
              <span style={{ color: "var(--forge)", fontWeight: 600 }}>v0.5 shipped</span>
            </span>
            <h1 className="display display-xl" style={{ margin: "24px 0 0" }}>
              <span style={{ fontWeight: 600 }}>Turn meetings</span>
              <br />
              <span className="light" style={{ fontWeight: 300 }}>into</span>{" "}
              <span className="accent" style={{ fontWeight: 700 }}>tickets</span>
              <span style={{ fontWeight: 600 }}>.</span>
              <br />
              <span
                className="serif-italic"
                style={{ color: "var(--muted)", letterSpacing: "-0.02em", fontSize: "0.85em" }}
              >
                in seconds.
              </span>
            </h1>
            <p className="lede" style={{ margin: "28px 0 0" }}>
              TicketForge converts meeting transcripts into properly-structured Linear, GitHub,
              and Notion tickets — with confidence-scored action items, smart assignee matching,
              and human review built in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/extract?sample=1" className="btn btn-primary btn-lg magnet">
                <Play className="h-3.5 w-3.5 fill-current" />
                Try with sample transcript
              </Link>
              <Link href="/extract" className="btn btn-secondary btn-lg magnet">
                Paste your own
                <span className="kbd">⌘V</span>
              </Link>
              <span className="ml-1 text-[13px]" style={{ color: "var(--muted-2)" }}>
                No login required for the demo.
              </span>
            </div>
          </div>

          {/* Hero browser mock with animated transcript + items */}
          <HeroMock />

          {/* Marquee */}
          <div className="reveal" style={{ marginTop: 80 }}>
            <div className="eyebrow" style={{ textAlign: "center", marginBottom: 18 }}>
              Built for teams using
            </div>
            <div className="marquee">
              <div className="marquee-track">
                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((it, i) => (
                  <div key={`${it.name}-${i}`} className="marquee-item">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: "var(--forge)" }}
                      aria-hidden
                    />
                    <span>{it.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-grad mx-auto" style={{ maxWidth: "90%" }} />

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "96px 0" }}>
        <div className="mx-auto max-w-[1200px] px-7">
          <div className="reveal" style={{ maxWidth: 720 }}>
            <div className="eyebrow">How it works</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              A pipeline you can actually{" "}
              <span className="serif-italic" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
                trust
              </span>
              .
            </h2>
            <p className="body-text" style={{ marginTop: 16, maxWidth: 620 }}>
              Three stages, one source of truth. Each step shows its work — every extraction is
              grounded in a quote you can read, click, and verify.
            </p>
          </div>
          <div
            className="reveal"
            style={{
              marginTop: 56,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <FeatureCard
              num="01"
              title="Extract with confidence"
              body="Confidence-scored items with the source quote attached to every extraction."
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <circle cx="12" cy="14" r="8" />
                  <path d="M12 10v4l2 2" />
                </svg>
              }
              footer={
                <>
                  <span className="conf conf-hi">0.94</span>
                  <span
                    className="serif-italic truncate text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    &ldquo;Aryan, take Stripe — it&apos;s blocking checkout.&rdquo;
                  </span>
                </>
              }
            />
            <FeatureCard
              num="02"
              title="Smart assignee matching"
              body="Fuzzy-matches transcript names — first names, nicknames, typos — to your Linear team."
              icon={<Search className="h-5 w-5" />}
              footer={
                <>
                  <span className="mono text-xs" style={{ color: "var(--muted)" }}>&ldquo;marcus&rdquo;</span>
                  <ArrowRight className="h-3 w-3" style={{ color: "var(--muted-2)" }} />
                  <span className="avatar-pill av-MC">MC</span>
                  <span style={{ color: "var(--ink-2)" }}>Marcus Chen</span>
                  <span className="ml-auto font-semibold" style={{ color: "#047857" }}>88%</span>
                </>
              }
            />
            <FeatureCard
              num="03"
              title="Review before push"
              body="Bulk actions, inline edits, source-of-truth quotes. No surprises in your board."
              icon={<ShieldCheck className="h-5 w-5" />}
              footer={
                <>
                  <span className="pill p-low">Bulk priority</span>
                  <span className="pill p-low">Reassign</span>
                  <span className="pill p-low">Skip</span>
                </>
              }
            />
          </div>
        </div>
      </section>

      <div className="divider-grad mx-auto" style={{ maxWidth: "90%" }} />

      {/* IMPACT */}
      <section id="impact" style={{ padding: "96px 0" }}>
        <div className="mx-auto max-w-[1200px] px-7">
          <div className="reveal" style={{ maxWidth: 640 }}>
            <div className="eyebrow">Business impact</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              Save{" "}
              <span className="accent" style={{ fontWeight: 700 }}>
                $130K&nbsp;a&nbsp;year
              </span>{" "}
              on a 20-person team.
            </h2>
          </div>
          <div
            className="reveal"
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <StatCard count={6} suffix=" hrs/wk" body="Time PMs spend converting notes manually." />
            <StatCard count={95} suffix="%" body="Reduction in that overhead with TicketForge." accent />
            <StatCard count={10} suffix=" min" body="Average time per meeting end-to-end." />
            <StatCard count={142} suffix="K" body="Tickets created across teams using TicketForge." />
          </div>
          <p className="body-text reveal" style={{ maxWidth: 720, marginTop: 40 }}>
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

function FeatureCard({
  num,
  title,
  body,
  icon,
  footer,
}: {
  num: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="surface-card card-tilt tiltable" style={{ padding: 28 }}>
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[10px]"
          style={{ background: "var(--forge-soft)", color: "var(--forge)" }}
        >
          {icon}
        </div>
        <span className="mono text-xs" style={{ color: "var(--muted-2)" }}>{num}</span>
      </div>
      <h3 className="mt-[22px] text-[17px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <p className="body-text mt-1.5" style={{ fontSize: 14 }}>
        {body}
      </p>
      <div
        className="mt-[22px] flex items-center gap-2 pt-[18px] text-xs"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        {footer}
      </div>
    </div>
  );
}

function StatCard({
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
    <div className="surface-card relative overflow-hidden" style={{ padding: 28 }}>
      {accent ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(94,106,210,0.08), transparent 60%)",
          }}
        />
      ) : null}
      <div
        className="stat-num"
        data-count={count}
        data-suffix={suffix}
        style={{
          fontSize: "clamp(40px, 5vw, 56px)",
          fontWeight: 600,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          color: accent ? "var(--forge)" : "var(--ink)",
          position: "relative",
        }}
      >
        0
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: accent ? "var(--forge)" : "var(--muted)",
            marginLeft: 4,
          }}
        >
          {suffix.trim()}
        </span>
      </div>
      <div className="body-text mt-2.5 text-[13px] relative">{body}</div>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="reveal" style={{ position: "relative", marginTop: 72 }}>
      <div className="browser-reflection" />
      <div className="browser-shell">
        <div className="browser-bar">
          <span className="b-dot" />
          <span className="b-dot" />
          <span className="b-dot" />
          <span
            className="ml-2.5 mono inline-flex items-center gap-1.5 text-[11px]"
            style={{ color: "var(--muted)" }}
          >
            <Lock className="h-3 w-3" />
            ticketforge.app/extract
          </span>
          <div className="ml-auto pulse-status" id="hero-status">
            <span className="pulse" />
            <span id="hero-status-label">Listening…</span>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="hero-mock-grid grid md:grid-cols-[1.1fr_1fr]">
            <div
              className="px-6 py-5"
              style={{ borderRight: "1px solid var(--line)" }}
            >
              <div className="eyebrow mb-3">Transcript · Eng sync · Tue 10:00</div>
              <div id="hero-transcript" style={{ minHeight: 240 }} />
            </div>
            <div className="px-5 py-[18px]">
              <div className="flex items-center justify-between mb-3.5">
                <div className="eyebrow">Extracted action items</div>
                <span className="mono text-[11px]" style={{ color: "var(--muted-2)" }} id="hero-count">
                  0 / 4
                </span>
              </div>
              <div id="hero-items" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ borderTop: "1px solid var(--line)" }}
    >
      <Atmosphere opacity={0.35} withDotgrid={false} />
      <div className="scanlines" />
      <div className="relative mx-auto max-w-[1200px] px-7 pt-20">
        <div
          className="grid gap-10"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
        >
          <div className="reveal" style={{ gridColumn: "1 / -1", maxWidth: 420 }}>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white"
                style={{
                  background: "linear-gradient(135deg, #5e6ad2 0%, #9aa3f0 70%)",
                  boxShadow: "0 2px 6px rgba(94,106,210,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
                aria-hidden
              >
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">TicketForge</span>
            </Link>
            <p className="body-text mt-3">
              Meetings → tickets, in seconds. No more transcription archaeology on Friday afternoon.
            </p>
            <div className="mt-5" style={{ maxWidth: 380 }}>
              <div className="eyebrow mb-2.5">Newsletter</div>
              <form
                className="flex items-stretch gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const input = target.querySelector("input") as HTMLInputElement | null;
                  const btn = target.querySelector("button span") as HTMLSpanElement | null;
                  if (input) input.value = "";
                  if (btn) btn.textContent = "Subscribed ✓";
                }}
              >
                <div className="grad-border" style={{ flex: 1 }}>
                  <input type="email" placeholder="you@company.com" required />
                </div>
                <button className="btn btn-primary" type="submit">
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
              { label: "Pricing", href: "/impact" },
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
            title="Company"
            links={[
              { label: "About", href: "/" },
              { label: "Devpost", href: "#" },
              { label: "Hackathon", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Security", href: "#" },
            ]}
          />
        </div>

        <div
          className="mt-14 flex flex-wrap items-center justify-between gap-3 py-6 text-[13px]"
          style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}
        >
          <div>© 2026 TicketForge · Built for the Internal Tools Hacks hackathon</div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/aryangorde8/TicketForge" className="inline-flex items-center gap-2">
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="reveal relative overflow-hidden pb-2 mt-6">
          <div className="word-huge text-center">TicketForge</div>
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
      <div className="eyebrow mb-4">{title}</div>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm" style={{ color: "var(--muted)" }}>
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href}>{l.label}</Link>
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
        const unit = el.querySelector(".stat-unit")?.outerHTML ?? "";
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
      if (p === "urgent") return '<span class="pill p-urgent"><span class="dot" style="background:#F43F5E;"></span>Urgent</span>';
      if (p === "high") return '<span class="pill p-high"><span class="dot" style="background:#F97316;"></span>High</span>';
      if (p === "med") return '<span class="pill p-med"><span class="dot" style="background:#0EA5E9;"></span>Med</span>';
      return '<span class="pill p-low"><span class="dot"></span>Low</span>';
    }
    function confPill(c: number) {
      const cls = c >= 0.85 ? "conf-hi" : c >= 0.7 ? "conf-med" : "conf-low";
      return `<span class="conf ${cls}">${c.toFixed(2)}</span>`;
    }
    function renderItems(n: number) {
      let html = "";
      items.forEach((it, i) => {
        const cls = i < n ? "in" : "";
        html += `<div class="item-row ${cls}" style="display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:var(--bg-quiet);border:1px solid var(--line);margin-bottom:8px;opacity:${i < n ? 1 : 0};transform:${i < n ? "none" : "translateY(8px) scale(0.98)"};transition:opacity .5s cubic-bezier(.2,.8,.2,1),transform .5s cubic-bezier(.2,.8,.2,1);transition-delay:${i * 60}ms;">
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--ink);letter-spacing:-0.005em;">${it.title}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><span class="avatar-pill av-${it.who}" style="width:16px;height:16px;font-size:9px;">${it.who}</span>${it.whoName} ${priorityPill(it.priority)}</div>
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
            `<span style="display:block;font-family:var(--font-mono),monospace;font-size:12.5px;line-height:1.85;color:var(--ink-2);"><span style="color:var(--forge);font-weight:600;">${l.speaker}:</span> ${l.text}</span>`
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
            "display:block;font-family:var(--font-mono),monospace;font-size:12.5px;line-height:1.85;color:var(--ink-2);";
          wrap.innerHTML = `<span style="color:var(--forge);font-weight:600;">${line.speaker}:</span> `;
          const textNode = document.createElement("span");
          wrap.appendChild(textNode);
          const caret = document.createElement("span");
          caret.style.cssText =
            "display:inline-block;width:7px;height:14px;background:var(--forge);transform:translateY(2px);margin-left:1px;animation:blink 1s steps(1) infinite;";
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

    const browser = transcriptEl.closest(".browser-shell");
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

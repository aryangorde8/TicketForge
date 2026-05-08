import Link from "next/link";
import { useEffect } from "react";
import { Play } from "lucide-react";
import { Atmosphere, useMagnet, useReveal } from "@/components/atmosphere";
import { Meta } from "@/components/meta";
import { SiteHeader } from "@/components/site-header";

export default function ImpactPage() {
  useReveal();
  useMagnet();
  useStatCount();

  return (
    <>
      <Meta
        title="Business impact"
        path="/impact"
        description="Engineering managers spend 4–6 hours per week converting meeting notes into tickets. For a 20-person team, that's $130K/year in lost capacity. TicketForge fixes that."
      />
      <SiteHeader variant="marketing" />

      <div style={{ position: "relative", padding: "96px 0" }}>
        <Atmosphere opacity={0.35} style={{ height: 360, top: 0 }} />

        <div className="relative z-[2] mx-auto max-w-[1200px] px-7">
          <div className="reveal" style={{ maxWidth: 720 }}>
            <div className="eyebrow">Business impact</div>
            <h1 className="display display-lg" style={{ marginTop: 14 }}>
              Save{" "}
              <span className="accent" style={{ fontWeight: 700 }}>
                $130K&nbsp;a&nbsp;year
              </span>{" "}
              <br className="hidden sm:block" />
              on a 20-person team.
            </h1>
          </div>

          <div
            className="reveal"
            style={{
              marginTop: 48,
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

          <div
            className="reveal surface-card"
            style={{
              marginTop: 56,
              padding: 32,
            }}
          >
            <h2 className="text-xl font-semibold tracking-tight">The math</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MathRow label="Avg. time spent per week on ticket creation" value="5 hrs" />
              <MathRow label="Loaded cost per engineer/PM (annual)" value="$90K" />
              <MathRow label="Hourly cost" value="$43/hr" />
              <MathRow label="Weekly cost (team of 20)" value="$4,300" />
              <MathRow label="Annual cost" value="$223K" />
              <MathRow label="With TicketForge (95% reduction)" value="~$11K" accent />
            </div>
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>
              Estimates based on a 20-person product + engineering team. Actual savings vary by
              team size and meeting frequency.
            </p>
          </div>

          <div className="reveal mt-14 flex items-center gap-3 flex-wrap">
            <Link href="/extract?sample=1" className="btn btn-primary magnet">
              <Play className="h-3.5 w-3.5 fill-current" />
              Try with sample transcript
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm hover:opacity-100"
              style={{ color: "var(--muted)" }}
            >
              See how it works →
            </Link>
          </div>
        </div>
      </div>
    </>
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

function MathRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between pb-3"
      style={{ borderBottom: "1px solid var(--line)" }}
    >
      <span className="text-sm" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: accent ? "var(--forge)" : "var(--ink)" }}>
        {value}
      </span>
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

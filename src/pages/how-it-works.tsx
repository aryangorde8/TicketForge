import Link from "next/link";
import { ArrowRight, Gauge, Play, Search, ShieldCheck } from "lucide-react";
import { Atmosphere, useMagnet, useReveal } from "@/components/atmosphere";
import { Meta } from "@/components/meta";
import { SiteHeader } from "@/components/site-header";

export default function HowItWorksPage() {
  useReveal();
  useMagnet();

  return (
    <>
      <Meta
        title="How it works"
        path="/how-it-works"
        description="A 4-step pipeline: paste/record transcript → confidence-scored extraction → human review → push to Linear, GitHub, Notion, or Slack."
      />
      <SiteHeader variant="marketing" />

      <div style={{ position: "relative", padding: "96px 0" }}>
        <Atmosphere opacity={0.35} style={{ height: 360, top: 0 }} />
        <div className="relative z-[2] mx-auto max-w-[1200px] px-7">
          <div className="reveal" style={{ maxWidth: 720 }}>
            <div className="eyebrow">How it works</div>
            <h1 className="display display-lg" style={{ marginTop: 14 }}>
              A pipeline you can actually{" "}
              <span className="serif-italic" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
                trust
              </span>
              .
            </h1>
            <p className="lede" style={{ marginTop: 16 }}>
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
            <Card
              n="01"
              icon={<Gauge className="h-5 w-5" />}
              title="Extract with confidence"
              body="Confidence-scored items with the source quote attached to every extraction."
              foot={
                <>
                  <span className="conf conf-hi">0.94</span>
                  <span className="serif-italic truncate text-sm" style={{ color: "var(--muted)" }}>
                    &ldquo;Aryan, take Stripe — it&apos;s blocking checkout.&rdquo;
                  </span>
                </>
              }
            />
            <Card
              n="02"
              icon={<Search className="h-5 w-5" />}
              title="Smart assignee matching"
              body="Fuzzy-matches transcript names — first names, nicknames, typos — to your Linear team."
              foot={
                <>
                  <span className="mono text-xs" style={{ color: "var(--muted)" }}>&ldquo;marcus&rdquo;</span>
                  <ArrowRight className="h-3 w-3" style={{ color: "var(--muted-2)" }} />
                  <span className="avatar-pill av-MC">MC</span>
                  <span style={{ color: "var(--ink-2)" }}>Marcus Chen</span>
                  <span className="ml-auto font-semibold" style={{ color: "#047857" }}>88%</span>
                </>
              }
            />
            <Card
              n="03"
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Review before push"
              body="Bulk actions, inline edits, source-of-truth quotes. No surprises in your board."
              foot={
                <>
                  <span className="pill p-low">Bulk priority</span>
                  <span className="pill p-low">Reassign</span>
                  <span className="pill p-low">Skip</span>
                </>
              }
            />
          </div>

          <div className="reveal mt-14 flex flex-wrap items-center gap-3">
            <Link href="/extract?sample=1" className="btn btn-primary magnet">
              <Play className="h-3.5 w-3.5 fill-current" />
              Try with sample transcript
            </Link>
            <Link
              href="/impact"
              className="text-sm hover:opacity-100"
              style={{ color: "var(--muted)" }}
            >
              See business impact →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Card({
  n,
  icon,
  title,
  body,
  foot,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  foot: React.ReactNode;
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
        <span className="mono text-xs" style={{ color: "var(--muted-2)" }}>{n}</span>
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
        {foot}
      </div>
    </div>
  );
}

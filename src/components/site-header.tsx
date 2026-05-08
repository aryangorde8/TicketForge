import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export type StepKey = "paste" | "review" | "pushed" | null;

interface SiteHeaderProps {
  variant?: "marketing" | "app";
  step?: StepKey;
  showAvatar?: boolean;
}

export function SiteHeader({
  variant = "marketing",
  step = null,
  showAvatar = false,
}: SiteHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--line)",
        background: "color-mix(in srgb, var(--bg) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-7">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white shadow"
            style={{
              background: "linear-gradient(135deg, #5e6ad2 0%, #9aa3f0 70%)",
              boxShadow: "0 2px 6px rgba(94,106,210,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m14.5 9.5 5 5" />
              <path d="m12 8 4 4" />
              <path d="M3 21l1.5-1.5" />
              <path d="M5.5 17.5 17 6l1 1L6.5 18.5z" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
            TicketForge
          </span>
        </Link>

        {variant === "marketing" ? (
          <nav className="hidden items-center gap-7 text-sm md:flex" style={{ color: "var(--muted)" }}>
            <Link href="/how-it-works" className="hover:opacity-100 transition-opacity">
              How it works
            </Link>
            <Link href="/impact" className="hover:opacity-100 transition-opacity">
              Business impact
            </Link>
            <Link href="/extract" className="hover:opacity-100 transition-opacity">
              Try it
            </Link>
          </nav>
        ) : (
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <StepPillV2 label="1. Paste" active={step === "paste"} />
            <span className="tl-sep">›</span>
            <StepPillV2 label="2. Review" active={step === "review"} />
            <span className="tl-sep">›</span>
            <StepPillV2 label="3. Push" active={step === "pushed"} done={step === "pushed"} />
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {variant === "marketing" ? (
            <Link href="/extract" className="btn btn-primary magnet">
              Try it now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : showAvatar ? (
            <span
              className="avatar-pill av-AG"
              style={{ width: 30, height: 30, fontSize: 11 }}
              aria-label="You"
            >
              AG
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function StepPillV2({
  label,
  active,
  done,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  const cls = done ? "step-pill-v2 done" : active ? "step-pill-v2 active" : "step-pill-v2";
  return <span className={cls}>{label}</span>;
}

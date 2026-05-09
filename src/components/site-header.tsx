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
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        borderBottom: "1px solid var(--ink)",
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
      }}
    >
      <div className="mx-auto flex h-[60px] max-w-[1320px] items-center justify-between px-7">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span
            className="inline-flex h-7 w-7 items-center justify-center"
            style={{
              border: "1.5px solid var(--ink)",
              color: "var(--ink)",
            }}
            aria-hidden
          >
            <span
              className="serif-italic"
              style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}
            >
              T
            </span>
          </span>
          <span
            className="serif-italic"
            style={{
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >
            TicketForge
          </span>
        </Link>

        {variant === "marketing" ? (
          <nav
            className="hidden items-center gap-7 md:flex"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--ink)",
            }}
          >
            <Link href="/#how" className="hover:opacity-60">
              How it works
            </Link>
            <Link href="/#impact" className="hover:opacity-60">
              Impact
            </Link>
            <a
              href="https://github.com/aryangorde8/TicketForge"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-60"
            >
              GitHub
            </a>
          </nav>
        ) : (
          <nav className="hidden items-center gap-3 md:flex">
            <StepEdit num="01" label="Paste" active={step === "paste"} />
            <StepEdit num="02" label="Review" active={step === "review"} />
            <StepEdit num="03" label="Push" active={step === "pushed"} done={step === "pushed"} />
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {variant === "marketing" ? (
            <Link href="/extract" className="btn btn-primary magnet">
              Try it now
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : showAvatar ? (
            <span
              className="inline-flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                border: "1px solid var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink)",
              }}
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

function StepEdit({
  num,
  label,
  active,
  done,
}: {
  num: string;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: active || done ? "var(--ink)" : "var(--muted-2)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          border: "1px solid currentColor",
          fontWeight: 600,
          background: active ? "var(--ink)" : "transparent",
          color: active ? "var(--bg)" : "currentColor",
        }}
      >
        {done ? "✓" : num}
      </span>
      <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
    </span>
  );
}

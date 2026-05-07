import Link from "next/link";
import { ArrowRight, LifeBuoy, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#5E6AD2] to-[#7B86E0] text-white">
            <WandSparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            TicketForge
          </span>
        </Link>

        {variant === "marketing" ? (
          <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
            <a href="#how" className="hover:text-zinc-900">
              How it works
            </a>
            <a href="#impact" className="hover:text-zinc-900">
              Business impact
            </a>
            <a
              href="https://linear.app"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900"
            >
              Linear
            </a>
          </nav>
        ) : (
          <nav className="hidden items-center gap-1 text-sm text-zinc-500 md:flex">
            <StepPill label="1. Paste" active={step === "paste"} />
            <ChevronSep />
            <StepPill label="2. Review" active={step === "review"} />
            <ChevronSep />
            <StepPill
              label="3. Push"
              active={step === "pushed"}
              done={step === "pushed"}
            />
          </nav>
        )}

        <div className="flex items-center gap-2">
          {variant === "marketing" ? (
            <>
              <Link
                href="/extract"
                className="hidden rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:text-zinc-900 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link href="/extract">
                <Button className="bg-forge hover:bg-forge-hover text-white">
                  Try it now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-700 hover:text-zinc-900"
              >
                <LifeBuoy className="h-4 w-4" /> Help
              </Button>
              {showAvatar ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-300 text-xs font-medium text-amber-900 ring-2 ring-white">
                  YOU
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function StepPill({
  label,
  active,
  done,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  let cls = "text-zinc-500";
  if (done)
    cls = "bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-1.5";
  else if (active) cls = "bg-zinc-100 text-zinc-900 font-medium";
  return <span className={`rounded-md px-2.5 py-1 ${cls}`}>{label}</span>;
}

function ChevronSep() {
  return <span className="text-zinc-300">›</span>;
}

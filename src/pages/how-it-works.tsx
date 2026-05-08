import Link from "next/link";
import { ArrowRight, Gauge, Play, ShieldCheck, UserSearch } from "lucide-react";
import { Meta } from "@/components/meta";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    n: "01",
    icon: Gauge,
    title: "Extract with confidence",
    body: "Confidence-scored items, with the source quote attached to every extraction.",
    foot: (
      <>
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
          0.94
        </span>
        <span className="truncate italic text-zinc-500">
          &ldquo;Aryan, take Stripe — it&apos;s blocking checkout.&rdquo;
        </span>
      </>
    ),
  },
  {
    n: "02",
    icon: UserSearch,
    title: "Smart assignee matching",
    body: "Fuzzy-matches transcript names — first names, nicknames, typos — to your Linear team.",
    foot: (
      <>
        <span className="font-mono text-zinc-500">&ldquo;marcus&rdquo;</span>
        <ArrowRight className="h-3 w-3 text-zinc-400" />
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-200 text-[9px] font-medium text-sky-900">
          MC
        </span>
        <span className="text-zinc-700">Marcus Chen</span>
        <span className="ml-auto font-medium text-emerald-700">88%</span>
      </>
    ),
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Review before push",
    body: "Bulk actions, inline edits, source-of-truth quotes. No surprises in your board.",
    foot: (
      <>
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700">
          Bulk priority
        </span>
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700">
          Reassign
        </span>
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700">
          Skip
        </span>
      </>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Meta title="How it works" path="/how-it-works" description="A 4-step pipeline: paste/record transcript → confidence-scored extraction → human review → push to Linear, GitHub, or Slack. Built on Llama 3.3 70B and Whisper via Groq." />
      <div className="min-h-screen bg-white text-zinc-900">
        <SiteHeader variant="marketing" />

        <main className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-forge text-xs font-semibold uppercase tracking-wider">
              How it works
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              A pipeline you can actually trust.
            </h1>
            <p className="mt-4 leading-relaxed text-zinc-600">
              Three stages, one file of context. Each step shows its work so
              you never have to guess what the model heard.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.n}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="bg-forge-soft text-forge flex h-9 w-9 items-center justify-center rounded-md">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {f.n}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {f.body}
                </p>
                <div className="mt-5 flex items-center gap-2 border-t border-zinc-100 pt-5 text-[11px]">
                  {f.foot}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex items-center gap-3">
            <Link href="/extract?sample=1">
              <Button className="bg-forge hover:bg-forge-hover text-white shadow-sm">
                <Play className="h-4 w-4" />
                Try with sample transcript
              </Button>
            </Link>
            <Link href="/impact" className="text-sm text-zinc-500 hover:text-zinc-900">
              See business impact →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

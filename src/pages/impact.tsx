import Head from "next/head";
import Link from "next/link";
import { Play } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function ImpactPage() {
  return (
    <>
      <Head>
        <title>Business impact — TicketForge</title>
      </Head>
      <div className="min-h-screen bg-white text-zinc-900">
        <SiteHeader variant="marketing" />

        <main className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-forge text-xs font-semibold uppercase tracking-wider">
              Business impact
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tight">
              Save <span className="text-forge">$130K/year</span> on a
              20-person team.
            </h1>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Stat number="4–6" unit="hrs/wk" body="Time PMs spend converting notes manually." />
            <Stat
              number="95"
              unit="%"
              body="Reduction in that overhead with TicketForge."
              accent
            />
            <Stat
              number="10"
              unit="min"
              body="Average time per meeting with TicketForge."
            />
          </div>

          <p className="mt-12 max-w-3xl leading-relaxed text-zinc-600">
            Engineering managers spend 4–6 hours per week converting meeting
            notes into tickets. For a 20-person product + engineering team at
            an average loaded cost of $90K/year, that&apos;s{" "}
            <span className="font-medium text-zinc-900">$144K/year</span> in
            lost capacity. TicketForge reduces this to ~10 minutes per
            meeting.
          </p>

          <div className="mt-14 rounded-lg border border-zinc-200 bg-zinc-50 p-8">
            <h2 className="text-xl font-semibold tracking-tight">The math</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MathRow label="Avg. time spent per week on ticket creation" value="5 hrs" />
              <MathRow label="Loaded cost per engineer/PM (annual)" value="$90K" />
              <MathRow label="Hourly cost" value="$43/hr" />
              <MathRow label="Weekly cost (team of 20)" value="$4,300" />
              <MathRow label="Annual cost" value="$223K" />
              <MathRow label="With TicketForge (95% reduction)" value="~$11K" accent />
            </div>
            <p className="mt-6 text-sm text-zinc-500">
              Estimates based on a 20-person product + engineering team. Actual savings vary by team size and meeting frequency.
            </p>
          </div>

          <div className="mt-14 flex items-center gap-3">
            <Link href="/extract?sample=1">
              <Button className="bg-forge hover:bg-forge-hover text-white shadow-sm">
                <Play className="h-4 w-4" />
                Try with sample transcript
              </Button>
            </Link>
            <Link href="/how-it-works" className="text-sm text-zinc-500 hover:text-zinc-900">
              See how it works →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

function Stat({
  number,
  unit,
  body,
  accent,
}: {
  number: string;
  unit: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div
        className={`text-4xl font-semibold tracking-tight ${
          accent ? "text-forge" : "text-zinc-900"
        }`}
      >
        {number}
        <span className="text-lg font-medium text-zinc-500"> {unit}</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</div>
    </div>
  );
}

function MathRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
      <span className="text-sm text-zinc-600">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-forge" : "text-zinc-900"}`}>
        {value}
      </span>
    </div>
  );
}

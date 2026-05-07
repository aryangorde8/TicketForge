import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Gauge,
  Hash,
  Lock,
  Mic,
  Monitor,
  Play,
  ShieldCheck,
  SquareStack,
  Trophy,
  UserSearch,
  Video,
  WandSparkles,
} from "lucide-react";
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

const LOGOS = [
  { icon: SquareStack, label: "Linear" },
  { icon: Hash, label: "Slack huddles" },
  { icon: Video, label: "Zoom transcripts" },
  { icon: Monitor, label: "Google Meet" },
  { icon: Mic, label: "Otter.ai" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>TicketForge — Turn meetings into tickets</title>
        <meta
          name="description"
          content="TicketForge converts meeting transcripts into properly-structured Linear tickets with confidence-scored action items, smart assignee matching, and human review built in."
        />
      </Head>
      <div className="min-h-screen bg-white text-zinc-900">
        <SiteHeader variant="marketing" />

        {/* Hero */}
        <section className="bg-noise relative">
          <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Now with confidence-scored extraction
                <span className="text-zinc-300">·</span>
                <span className="text-forge font-medium">v0.4 shipped</span>
              </div>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl">
                Turn meetings <br className="hidden sm:block" />
                into tickets.{" "}
                <span className="text-zinc-400">In seconds.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
                TicketForge converts meeting transcripts into
                properly-structured Linear tickets — with confidence-scored
                action items, smart assignee matching, and human review built
                in.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/extract?sample=1">
                  <Button className="bg-forge hover:bg-forge-hover text-white shadow-sm">
                    <Play className="h-4 w-4" />
                    Try with sample transcript
                  </Button>
                </Link>
                <Link href="/extract">
                  <Button variant="outline" className="bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900">
                    Paste your own
                    <Kbd>⌘V</Kbd>
                  </Button>
                </Link>
                <span className="ml-1 text-xs text-zinc-500">
                  No login required for the demo.
                </span>
              </div>
            </div>

            {/* Hero product mock */}
            <div className="relative mt-14">
              <div className="from-forge/10 pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b via-transparent to-transparent blur-2xl" />
              <div className="mock-shadow relative overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <div className="flex h-9 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <div className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                    <Lock className="h-3 w-3" />
                    ticketforge.app/review
                  </div>
                </div>
                <HeroMock />
              </div>
            </div>

            {/* Logo strip */}
            <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-3 text-xs text-zinc-500">
              <span className="uppercase tracking-wider">
                Built for teams using
              </span>
              {LOGOS.map((l) => (
                <div
                  key={l.label}
                  className="flex items-center gap-2 font-semibold text-zinc-700"
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section id="how" className="border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <div className="text-forge text-xs font-semibold uppercase tracking-wider">
                How it works
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                A pipeline you can actually trust.
              </h2>
              <p className="mt-3 leading-relaxed text-zinc-600">
                Three stages, one file of context. Each step shows its work so
                you never have to guess what the model heard.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
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
          </div>
        </section>

        {/* Business impact */}
        <section
          id="impact"
          className="border-y border-zinc-200 bg-zinc-50"
        >
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="text-forge text-xs font-semibold uppercase tracking-wider">
                  Business impact
                </div>
                <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
                  Save <span className="text-forge">$130K/year</span> on a
                  20-person team.
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3 md:col-span-7">
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
            </div>
            <p className="mt-10 max-w-3xl leading-relaxed text-zinc-600">
              Engineering managers spend 4–6 hours per week converting meeting
              notes into tickets. For a 20-person product + engineering team at
              an average loaded cost of $90K/year, that&apos;s{" "}
              <span className="font-medium text-zinc-900">$144K/year</span> in
              lost capacity. TicketForge reduces this to ~10 minutes per
              meeting.
            </p>
          </div>
        </section>

        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="relative inline-flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-[#5E6AD2] to-[#7B86E0] text-white">
                <WandSparkles className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold text-zinc-900">TicketForge</span>
              <span className="text-zinc-400">·</span>
              <span>A hackathon submission, 2026</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-zinc-600">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-zinc-900"
              >
                <Code2 className="h-4 w-4" /> GitHub
              </a>
              <a
                href="https://devpost.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-zinc-900"
              >
                <Trophy className="h-4 w-4" /> Devpost
              </a>
            </div>
          </div>
        </footer>
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
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div
        className={`text-3xl font-semibold tracking-tight ${
          accent ? "text-forge" : "text-zinc-900"
        }`}
      >
        {number}
        <span className="text-base font-medium text-zinc-500"> {unit}</span>
      </div>
      <div className="mt-1 text-xs leading-relaxed text-zinc-600">{body}</div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[11px] leading-none text-zinc-700 shadow-[0_1px_0_#e5e7eb]">
      {children}
    </span>
  );
}

function HeroMock() {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-3 border-r border-zinc-200 bg-zinc-50/60 p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Meeting
        </div>
        <div className="mt-2 text-sm font-medium text-zinc-900">
          Eng Sync · Tue 10:00
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          42 min · 6 participants
        </div>
        <div className="mt-5 space-y-1.5">
          <div className="ring-soft flex items-center gap-2 rounded bg-white px-2 py-1.5 text-xs text-zinc-600">
            Transcript
          </div>
          <div className="bg-forge-soft text-forge flex items-center gap-2 rounded px-2 py-1.5 text-xs font-medium">
            Action items
            <span className="text-forge ml-auto rounded bg-white px-1.5 text-[10px]">
              7
            </span>
          </div>
          <div className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-600">
            Assignees
          </div>
        </div>
      </div>
      <div className="col-span-9 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900">
              Action items
            </div>
            <div className="text-xs text-zinc-500">
              Reviewed by you · ready to push
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">7 items</span>
            <button className="bg-forge hover:bg-forge-hover inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white">
              Push to Linear
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.7fr] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500">
            <div>Title</div>
            <div>Assignee</div>
            <div>Priority</div>
            <div>Due</div>
            <div className="text-right">Conf.</div>
          </div>
          <MockRow
            title="Investigate Stripe gateway timeout"
            initials="AG"
            avatarCls="bg-amber-200 text-amber-900"
            assignee="Aryan Gorde"
            priority="urgent"
            due="May 14"
            conf="0.94"
            confTone="green"
          />
          <MockRow
            title="Migrate auth service to OAuth2"
            initials="MC"
            avatarCls="bg-sky-200 text-sky-900"
            assignee="Marcus Chen"
            priority="high"
            due="Next sprint"
            conf="0.91"
            confTone="green"
          />
          <MockRow
            title="Investigate rate limiting for public API"
            initials="?"
            avatarCls="bg-zinc-200 text-zinc-500"
            assignee="Unassigned"
            assigneeMuted
            priority="low"
            due="—"
            dueMuted
            conf="0.61"
            confTone="amber"
            last
          />
        </div>
      </div>
    </div>
  );
}

function MockRow({
  title,
  initials,
  avatarCls,
  assignee,
  assigneeMuted,
  priority,
  due,
  dueMuted,
  conf,
  confTone,
  last,
}: {
  title: string;
  initials: string;
  avatarCls: string;
  assignee: string;
  assigneeMuted?: boolean;
  priority: "urgent" | "high" | "medium" | "low";
  due: string;
  dueMuted?: boolean;
  conf: string;
  confTone: "green" | "amber";
  last?: boolean;
}) {
  const priCls =
    priority === "urgent"
      ? "bg-rose-50 text-rose-700"
      : priority === "high"
        ? "bg-orange-50 text-orange-700"
        : priority === "medium"
          ? "bg-sky-50 text-sky-700"
          : "bg-zinc-100 text-zinc-700";
  const priLabel = priority[0].toUpperCase() + priority.slice(1);
  const confCls =
    confTone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";
  return (
    <div
      className={`grid grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.7fr] items-center px-3 py-2.5 text-xs ${
        last ? "" : "border-b border-zinc-100"
      }`}
    >
      <div className="truncate text-zinc-900">{title}</div>
      <div className="flex items-center gap-1.5">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium ${avatarCls}`}
        >
          {initials}
        </span>
        <span
          className={`truncate ${assigneeMuted ? "italic text-zinc-500" : "text-zinc-700"}`}
        >
          {assignee}
        </span>
      </div>
      <div>
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${priCls}`}
        >
          {priLabel}
        </span>
      </div>
      <div className={dueMuted ? "text-zinc-400" : "text-zinc-600"}>{due}</div>
      <div className="text-right">
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${confCls}`}
        >
          {conf}
        </span>
      </div>
    </div>
  );
}

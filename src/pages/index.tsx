import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Hash,
  Lock,
  Mic,
  Monitor,
  Play,
  SquareStack,
  Trophy,
  Video,
  WandSparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

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

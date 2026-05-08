import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Meta } from "@/components/meta";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  History,
  Loader2,
  Quote,
  RotateCcw,
  Search,
  SquareStack,
  Trash2,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import {
  Avatar,
  ConfidenceBadge,
  PriorityBadge,
} from "@/components/badges";
import {
  loadExtract,
  saveExtract,
  clearExtract,
  type ExtractPayload,
} from "@/lib/extract-store";
import type { Priority, ReviewItem, PushResult, StalledIssue } from "@/lib/types";

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];
const UNASSIGNED = "__none__";

const COLS =
  "grid grid-cols-[36px_minmax(0,2.4fr)_minmax(0,1.3fr)_120px_140px_120px_36px]";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ExtractPayload | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [lowConfOnly, setLowConfOnly] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResults, setPushResults] = useState<PushResult[] | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [destination, setDestination] = useState<"linear" | "github" | "notion">("linear");
  const [stalled, setStalled] = useState<StalledIssue[] | null>(null);
  const [stalledLoading, setStalledLoading] = useState(false);
  const [stalledDismissed, setStalledDismissed] = useState(false);

  useEffect(() => {
    const payload = loadExtract();
    setData(payload);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (data) saveExtract(data);
  }, [data]);

  useEffect(() => {
    if (!hydrated || !data || stalled !== null || stalledLoading) return;
    const hints = Array.from(
      new Set(
        (data.items ?? [])
          .map((it) => it.assignee_hint)
          .filter((h): h is string => Boolean(h))
      )
    );
    if (hints.length === 0) {
      setStalled([]);
      return;
    }
    setStalledLoading(true);
    fetch("/api/stalled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignee_hints: hints, stale_days: 7 }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res?.issues)) setStalled(res.issues);
        else setStalled([]);
      })
      .catch(() => setStalled([]))
      .finally(() => setStalledLoading(false));
  }, [hydrated, data, stalled, stalledLoading]);

  const items = data?.items ?? [];
  const teams = data?.teams ?? [];

  const users = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    items.forEach((it) => {
      if (it.assignee_user_id) {
        seen.set(it.assignee_user_id, {
          id: it.assignee_user_id,
          name: it.assignee_hint || it.assignee_user_id,
        });
      }
    });
    return Array.from(seen.values());
  }, [items]);

  const filtered = useMemo(() => {
    let base = items;
    if (lowConfOnly) base = base.filter((it) => it.confidence < 0.85);
    const q = filter.trim().toLowerCase();
    if (!q) return base;
    return base.filter((it) =>
      [it.title, it.description, it.assignee_hint, it.source_quote]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q))
    );
  }, [items, filter, lowConfOnly]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader variant="app" step="review" showAvatar />
        <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-zinc-500">
          Loading…
        </div>
      </div>
    );
  }

  if (!data || items.length === 0 && !data.meeting_summary) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader variant="app" step="review" showAvatar />
        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Nothing to review yet
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Paste a transcript on the extract page to get started.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push("/extract")}
              className="bg-forge hover:bg-forge-hover text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Go to extract
            </Button>
          </div>
        </main>
      </div>
    );
  }

  function updateItem(id: string, patch: Partial<ReviewItem>) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              it.id === id ? { ...it, ...patch } : it
            ),
          }
        : prev
    );
  }

  function bulkUpdate(patch: Partial<ReviewItem>) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              selected.has(it.id) ? { ...it, ...patch } : it
            ),
          }
        : prev
    );
  }

  function deleteItem(id: string) {
    setData((prev) =>
      prev ? { ...prev, items: prev.items.filter((it) => it.id !== id) } : prev
    );
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function bulkDelete() {
    setData((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((it) => !selected.has(it.id)) }
        : prev
    );
    setSelected(new Set());
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length)
      setSelected(new Set());
    else setSelected(new Set(filtered.map((it) => it.id)));
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handlePush() {
    if (!data) return;
    setPushing(true);
    setPushError(null);
    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: data.items,
          team_id: data.default_team_id,
          destination,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Push failed");
      setPushResults(body.created);
    } catch (err) {
      setPushError(err instanceof Error ? err.message : "Push failed");
    } finally {
      setPushing(false);
    }
  }

  const allSelected =
    filtered.length > 0 && filtered.every((it) => selected.has(it.id));
  const hasSelection = selected.size > 0;
  const lowConfidenceCount = items.filter((it) => it.confidence < 0.7).length;
  const teamLabel = teams[0]
    ? `${teams[0].name} (${teams[0].key})`
    : "your default Linear team";

  if (pushResults !== null) {
    return (
      <SuccessScreen
        results={pushResults}
        skipped={lowConfidenceCount}
        destination={destination}
        onReset={() => {
          setPushResults(null);
          clearExtract();
          router.push("/extract");
        }}
      />
    );
  }

  return (
    <>
      <Meta title="Review" path="/review" />
      <div className="min-h-screen bg-white text-zinc-900">
        <SiteHeader variant="app" step="review" showAvatar />

        <main className="mx-auto max-w-6xl px-6 py-12">
          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <Calendar className="h-3.5 w-3.5" /> Meeting transcript ·{" "}
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">
                Review &amp; edit before pushing
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                onClick={() => router.push("/extract")}
              >
                <ArrowLeft className="h-4 w-4" /> Back to transcript
              </Button>
              <Button
                variant="outline"
                className="bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                onClick={() => router.push("/extract")}
              >
                <RotateCcw className="h-4 w-4" /> Re-extract
              </Button>
            </div>
          </div>

          {/* Impact mini-stats */}
          <ImpactStrip itemCount={items.length} highConfCount={items.filter((i) => i.confidence >= 0.85).length} />

          {/* Summary + Decisions */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm md:col-span-2">
              <div className="flex h-11 items-center justify-between border-b border-zinc-100 px-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="text-forge h-4 w-4" />
                  Meeting summary
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                  <span className="bg-forge h-1.5 w-1.5 rounded-full" />
                  Generated by Llama 3.3 · Groq
                </span>
              </div>
              <div className="p-5 text-sm leading-relaxed text-zinc-700">
                {data.meeting_summary ||
                  "No summary generated for this transcript."}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="flex h-11 items-center justify-between border-b border-zinc-100 px-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckSquare className="text-forge h-4 w-4" />
                  Decisions
                </div>
                <span className="text-[11px] text-zinc-500">
                  {data.decisions.length} made
                </span>
              </div>
              <ul className="space-y-2.5 p-5 text-sm leading-relaxed text-zinc-700">
                {data.decisions.length === 0 ? (
                  <li className="text-zinc-500 italic">No decisions captured.</li>
                ) : (
                  data.decisions.map((d, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                      {d}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Stalled commitments banner */}
          {!stalledDismissed && stalled && stalled.length > 0 ? (
            <StalledBanner
              issues={stalled}
              onDismiss={() => setStalledDismissed(true)}
            />
          ) : null}

          {/* Action items section */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight">
                  Action items
                </h2>
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
                {lowConfidenceCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    {lowConfidenceCount} need
                    {lowConfidenceCount === 1 ? "s" : ""} review
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setLowConfOnly((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                    lowConfOnly
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {lowConfOnly ? "Showing low-confidence only" : "Low confidence only"}
                </button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter items"
                    className="focus-visible:ring-forge-ring focus-visible:border-forge h-8 w-44 pl-7 pr-3 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bulk action toolbar */}
            {hasSelection ? (
              <div className="border-forge/30 bg-forge-soft mt-4 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <span className="text-forge inline-flex items-center gap-1.5 font-medium">
                  <CheckSquare className="h-4 w-4" />
                  {selected.size} selected
                </span>
                <span className="text-zinc-300">·</span>
                <Select
                  onValueChange={(v) =>
                    bulkUpdate({ priority: v as Priority })
                  }
                >
                  <SelectTrigger className="h-7 w-auto gap-1.5 border-0 bg-transparent px-2 text-sm shadow-none hover:bg-white">
                    <Flag className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Bulk edit priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p[0].toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(v) => {
                    const val = v as string;
                    bulkUpdate({
                      assignee_user_id: val === UNASSIGNED ? null : val,
                      match_score: null,
                    });
                  }}
                >
                  <SelectTrigger className="h-7 w-auto gap-1.5 border-0 bg-transparent px-2 text-sm shadow-none hover:bg-white">
                    <UserPlus className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Bulk assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={bulkDelete}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-rose-700 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="ml-auto text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Clear selection
                </button>
              </div>
            ) : null}

            {pushError ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {pushError}
              </div>
            ) : null}

            {/* Table */}
            <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
              {/* Header row */}
              <div
                className={`${COLS} h-10 items-center border-b border-zinc-200 bg-zinc-50 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500`}
              >
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </div>
                <div>Title</div>
                <div>Assignee</div>
                <div>Priority</div>
                <div>Due date</div>
                <div>Confidence</div>
                <div></div>
              </div>

              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-zinc-500">
                  {items.length === 0
                    ? "No action items extracted."
                    : "No items match the filter."}
                </div>
              ) : (
                filtered.map((item) => (
                  <ReviewRow
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    expanded={expanded.has(item.id)}
                    users={users}
                    onToggleSelected={() => toggleSelected(item.id)}
                    onToggleExpanded={() => toggleExpanded(item.id)}
                    onUpdate={(patch) => updateItem(item.id, patch)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))
              )}

              <div className="flex items-center justify-between bg-zinc-50/60 px-4 py-3 text-xs text-zinc-500">
                <span>
                  Showing {filtered.length} of {items.length} item
                  {items.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Push bar */}
            <div className="sticky bottom-4 mt-6">
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="bg-forge-soft text-forge inline-flex h-9 w-9 items-center justify-center rounded-md">
                    <SquareStack className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      Push to{" "}
                      <span className="font-mono">
                        {destination === "linear"
                          ? teamLabel
                          : destination === "github"
                            ? "GitHub Issues"
                            : "Notion database"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {destination === "linear"
                        ? "Created in default workflow state Backlog"
                        : destination === "github"
                          ? "Issues created with priority/assignee labels"
                          : "Pages created in your linked Notion database"}
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setDestination("linear")}
                      className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                        destination === "linear"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      Linear
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestination("github")}
                      className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                        destination === "github"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestination("notion")}
                      className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                        destination === "notion"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      Notion
                    </button>
                  </div>
                  <Button
                    onClick={handlePush}
                    disabled={pushing || items.length === 0}
                    className="bg-forge hover:bg-forge-hover h-auto rounded-md px-5 py-3 text-base font-medium text-white shadow-sm"
                  >
                    {pushing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Pushing to {destinationLabel(destination)}…
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        Push {items.length} item
                        {items.length === 1 ? "" : "s"} to{" "}
                        {destinationLabel(destination)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Linear workspace not loaded. Check that{" "}
                <code>LINEAR_API_KEY</code> is set in <code>.env.local</code>{" "}
                and restart the dev server before pushing.
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </>
  );
}

function ImpactStrip({
  itemCount,
  highConfCount,
}: {
  itemCount: number;
  highConfCount: number;
}) {
  const minutesManual = Math.max(15, itemCount * 6);
  const minutesAuto = Math.max(2, Math.round(itemCount * 0.4));
  const saved = minutesManual - minutesAuto;
  const savedPct = Math.round((saved / minutesManual) * 100);

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-4">
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Items extracted
        </div>
        <div className="mt-1 text-xl font-semibold text-zinc-900">{itemCount}</div>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          High confidence
        </div>
        <div className="mt-1 text-xl font-semibold text-emerald-600">
          {highConfCount}
          <span className="ml-1 text-sm font-normal text-zinc-400">
            / {itemCount}
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Time vs. manual
        </div>
        <div className="mt-1 text-xl font-semibold text-zinc-900">
          ~{minutesAuto} min
          <span className="ml-1 text-sm font-normal text-zinc-400 line-through">
            {minutesManual} min
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-forge/20 bg-forge-soft/60 px-4 py-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-forge">
          You saved
        </div>
        <div className="mt-1 text-xl font-semibold text-forge">
          {saved} min
          <span className="ml-1 text-sm font-normal text-forge/70">
            ({savedPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}

function StalledBanner({
  issues,
  onDismiss,
}: {
  issues: StalledIssue[];
  onDismiss: () => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, StalledIssue[]>();
    for (const issue of issues) {
      const key = issue.assigneeName ?? "Unassigned";
      const list = map.get(key) ?? [];
      list.push(issue);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [issues]);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
      <div className="flex items-start gap-3 border-b border-amber-200/70 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <History className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-amber-900">
              Stalled commitments from prior meetings
            </h3>
            <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
              {issues.length} item{issues.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
            These tickets are still open in Linear and haven&apos;t been touched
            in over a week. People in this meeting own them.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-amber-700 transition hover:bg-amber-100"
          aria-label="Dismiss"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="divide-y divide-amber-200/50 bg-white/60">
        {grouped.map(([owner, list]) => (
          <div key={owner} className="px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
              <span>{owner}</span>
              <span className="text-zinc-400">·</span>
              <span className="font-normal text-zinc-500">
                {list.length} stalled
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {list.map((iss) => (
                <li
                  key={iss.id}
                  className="flex items-center gap-3 text-xs"
                >
                  <a
                    href={iss.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    {iss.identifier}
                  </a>
                  <a
                    href={iss.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate text-zinc-800 hover:text-forge"
                  >
                    {iss.title}
                  </a>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 font-medium text-zinc-600">
                    <Clock className="h-3 w-3" />
                    {iss.daysSinceUpdate}d stale
                  </span>
                  <span className="text-zinc-400">{iss.state}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function destinationLabel(d: "linear" | "github" | "notion"): string {
  if (d === "linear") return "Linear";
  if (d === "github") return "GitHub";
  return "Notion";
}

function ReviewRow({
  item,
  selected,
  expanded,
  users,
  onToggleSelected,
  onToggleExpanded,
  onUpdate,
  onDelete,
}: {
  item: ReviewItem;
  selected: boolean;
  expanded: boolean;
  users: { id: string; name: string }[];
  onToggleSelected: () => void;
  onToggleExpanded: () => void;
  onUpdate: (patch: Partial<ReviewItem>) => void;
  onDelete: () => void;
}) {
  const isLowConfidence = item.confidence < 0.7;
  const matchPct =
    item.match_score != null ? Math.round(item.match_score * 100) : null;
  const assigneeUser = users.find((u) => u.id === item.assignee_user_id);
  const assigneeName = assigneeUser?.name ?? item.assignee_hint ?? null;

  let rowBg = "border-b border-zinc-100";
  if (selected) rowBg = "border-b border-zinc-100 bg-forge-soft/40";
  else if (isLowConfidence)
    rowBg = "border-b border-zinc-100 bg-amber-50/40";

  return (
    <div className={rowBg}>
      <div className={`${COLS} items-center px-3 py-3 text-sm`}>
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelected}
            aria-label="Select row"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleExpanded}
              className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Expand"
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="h-7 truncate border-transparent bg-transparent px-1 text-sm font-medium text-zinc-900 shadow-none hover:border-zinc-200 focus-visible:border-zinc-300"
            />
          </div>
          {isLowConfidence ? (
            <div className="ml-5 mt-0.5 inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">
              <AlertTriangle className="h-3 w-3" /> Review recommended ·
              low-confidence extraction
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={assigneeName} />
          <div className="min-w-0 flex-1">
            <Select
              value={item.assignee_user_id ?? UNASSIGNED}
              onValueChange={(v) => {
                const val = v as string;
                onUpdate({
                  assignee_user_id: val === UNASSIGNED ? null : val,
                  match_score: null,
                });
              }}
            >
              <SelectTrigger className="h-7 w-full border-0 bg-transparent px-1 text-sm shadow-none hover:bg-zinc-50 focus-visible:ring-0">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
                {item.assignee_user_id &&
                !users.find((u) => u.id === item.assignee_user_id) ? (
                  <SelectItem value={item.assignee_user_id}>
                    {item.assignee_hint || "matched user"}
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
            {matchPct != null && item.assignee_hint ? (
              <div className="px-1 text-[11px] font-medium text-emerald-700">
                {matchPct}% match
              </div>
            ) : item.assignee_hint && !item.assignee_user_id ? (
              <div className="px-1 text-[11px] text-amber-700">
                hint: {item.assignee_hint} · no match
              </div>
            ) : !item.assignee_hint && !item.assignee_user_id ? (
              <div className="px-1 text-[11px] text-zinc-400">no match found</div>
            ) : null}
          </div>
        </div>
        <div>
          <Select
            value={item.priority}
            onValueChange={(v) => onUpdate({ priority: v as Priority })}
          >
            <SelectTrigger className="h-7 w-[110px] border-0 bg-transparent px-1 text-xs shadow-none hover:bg-zinc-50 focus-visible:ring-0">
              <PriorityBadge value={item.priority} />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  <PriorityBadge value={p} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            value={item.due_date_hint ?? ""}
            onChange={(e) =>
              onUpdate({ due_date_hint: e.target.value || null })
            }
            placeholder="No date"
            className="h-7 w-[130px] border-0 bg-transparent px-1 text-xs text-zinc-700 shadow-none hover:bg-zinc-50 placeholder:text-zinc-400"
          />
        </div>
        <div>
          <ConfidenceBadge value={item.confidence} />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onDelete}
            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-700"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded ? (
        <div className="px-3 pb-4 pl-12">
          <div className="rounded-md border border-zinc-200 bg-zinc-50/70 px-4 py-3">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Quote className="h-3 w-3" /> Source quote from transcript
              </span>
            </div>
            <blockquote className="border-forge/40 mt-2 border-l-2 pl-3 text-sm italic leading-relaxed text-zinc-700">
              &ldquo;{item.source_quote}&rdquo;
            </blockquote>
            <div className="mt-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Description
              </div>
              <Textarea
                value={item.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="mt-1.5 min-h-[60px] resize-none border-zinc-200 bg-white text-sm"
              />
            </div>
            {item.assignee_hint ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5">
                  Owner hint: {item.assignee_hint}
                </span>
                {item.due_date_hint ? (
                  <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5">
                    Due: {item.due_date_hint}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SuccessScreen({
  results,
  skipped,
  destination,
  onReset,
}: {
  results: PushResult[];
  skipped: number;
  destination: "linear" | "github" | "notion";
  onReset: () => void;
}) {
  const minutesSaved = Math.max(15, results.length * 6);
  const destLabel = destinationLabel(destination);
  const subCopy =
    destination === "linear"
      ? "Pushed to your Linear workspace. Owners have been notified according to your team's default workflow."
      : destination === "github"
        ? "Issues opened in your GitHub repository with priority and assignee labels."
        : "Pages created in your linked Notion database with full metadata.";
  return (
    <>
      <Meta title="Pushed" path="/review" />
      <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
        <SiteHeader variant="app" step="pushed" showAvatar />

        <main className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="from-forge-soft/60 border-b border-zinc-100 bg-gradient-to-b to-white px-8 pt-10 pb-6 text-center">
                <div className="border-forge/20 mx-auto flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-sm">
                  <div className="bg-forge flex h-10 w-10 items-center justify-center rounded-full text-white">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight">
                  {results.length} ticket{results.length === 1 ? "" : "s"}{" "}
                  created in {destLabel}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
                  {subCopy}
                </p>
              </div>

              <ul className="divide-y divide-zinc-100">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-50/60"
                  >
                    <span className="text-forge bg-forge-soft shrink-0 rounded px-1.5 py-0.5 font-mono text-xs">
                      {r.identifier}
                    </span>
                    <span className="truncate text-sm text-zinc-900">
                      {r.title}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-zinc-400 hover:text-zinc-700"
                      aria-label="Open in Linear"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>

              {skipped > 0 ? (
                <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50/60 px-6 py-3 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    <span className="font-medium">
                      {skipped} low-confidence item
                      {skipped === 1 ? "" : "s"}
                    </span>{" "}
                    flagged in review — push them anyway by re-running
                    extract.
                  </span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-zinc-100 px-6 py-5">
                {results[0] ? (
                  <a
                    href={results[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-forge hover:bg-forge-hover inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Linear
                  </a>
                ) : null}
                <Button variant="outline" className="bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900" onClick={onReset}>
                  <RotateCcw className="h-4 w-4" />
                  Process another transcript
                </Button>
              </div>

              <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3 text-center text-xs text-zinc-600">
                Time saved vs. manual:{" "}
                <span className="font-medium text-zinc-900">
                  ~{minutesSaved} minutes
                </span>{" "}
                · You&apos;re welcome.
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-zinc-500">
              Want to wire this up to your team&apos;s Slack?{" "}
              <span className="text-forge font-medium">Coming soon.</span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

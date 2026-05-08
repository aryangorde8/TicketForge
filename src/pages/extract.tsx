import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Eraser,
  Info,
  Link as LinkIcon,
  Loader2,
  Lock,
  Mic,
  Settings2,
  Shield,
  Sparkles,
  Square,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";
import { SAMPLE_TRANSCRIPT } from "@/lib/sample-transcript";
import { saveExtract } from "@/lib/extract-store";

const PHASES = ["Analyzing transcript", "Extracting action items", "Matching assignees"];

export default function ExtractPage() {
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (router.query.sample === "1") {
      setTranscript(SAMPLE_TRANSCRIPT);
    }
  }, [router.query.sample]);

  useEffect(() => {
    if (!submitting) return;
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 2200);
    const t2 = setTimeout(() => setPhase(2), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [submitting]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordSeconds(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribe(blob, mimeType);
      };

      mediaRecorder.start();
      setRecording(true);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError("Microphone access denied. Allow mic access and try again.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function transcribe(blob: Blob, mimeType: string) {
    setTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Transcription failed");
      const newText = data.text as string;
      setTranscript((prev) => (prev ? prev + "\n\n" + newText : newText));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }

  async function handleExtract() {
    setError(null);
    if (!transcript.trim()) {
      setError("Paste a transcript first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Extraction failed");
      saveExtract({ ...data, transcript });
      router.push("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Extract — TicketForge</title>
      </Head>
      <div className="min-h-screen bg-white text-zinc-900">
        <SiteHeader variant="app" step="paste" showAvatar />

        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight">
              Paste your meeting transcript
            </h1>
            <p className="mt-2 leading-relaxed text-zinc-600">
              We&apos;ll extract action items, assignees, priorities, and due
              dates — every item linked back to the exact line it came from.
            </p>
          </div>

          {/* Transcript card */}
          <div className="mt-8 rounded-lg border border-zinc-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex h-11 items-center justify-between rounded-t-lg border-b border-zinc-200 bg-zinc-50/60 px-4">
              <div className="flex items-center gap-1">
                {recording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    </span>
                    <Square className="h-3 w-3" />
                    Stop · {formatDuration(recordSeconds)}
                  </button>
                ) : transcribing ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-forge-soft px-2.5 py-1 text-xs font-medium text-forge">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Transcribing…
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-md bg-forge px-2.5 py-1 text-xs font-medium text-white hover:bg-forge-hover disabled:opacity-50"
                  >
                    <Mic className="h-3 w-3" />
                    Record meeting
                  </button>
                )}
                <Divider />
                <ToolbarBtn icon={Upload} label="Upload .txt / .vtt" disabled />
                <Divider />
                <ToolbarBtn icon={LinkIcon} label="Paste from URL" disabled />
                <Divider />
                <ToolbarBtn icon={Settings2} label="Settings" disabled />
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Private to you
                </span>
              </div>
            </div>

            {/* Textarea */}
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                "Paste the transcript here — Zoom auto-transcript, Otter export, Notion meeting notes, anything readable.\n\nSpeaker labels like Marcus: dramatically improve assignee matching."
              }
              disabled={submitting}
              className="min-h-[440px] resize-none rounded-none border-0 bg-transparent px-6 py-5 font-mono text-[14px] leading-7 text-zinc-800 shadow-none focus-visible:ring-0"
            />

            {/* Footer */}
            <div className="flex h-11 items-center justify-between rounded-b-lg border-t border-zinc-200 bg-zinc-50/60 px-4">
              <button
                type="button"
                onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
                disabled={submitting}
                className="text-forge hover:text-forge-hover inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Or load sample transcript
              </button>
              <div className="font-mono text-[11px] text-zinc-500">
                <span className="text-zinc-700">
                  {transcript.length.toLocaleString()}
                </span>{" "}
                / 25,000 chars
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleExtract}
              disabled={submitting || !transcript.trim()}
              className="bg-forge hover:bg-forge-hover h-auto rounded-md px-5 py-3 text-base font-medium text-white shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {PHASES[phase]}…
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4" />
                  Extract Action Items
                  <Kbd>⌘ ↵</Kbd>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTranscript("")}
              disabled={submitting || !transcript}
              className="h-auto px-4 py-2.5"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
            <div className="ml-auto inline-flex items-center gap-2 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                <span className="bg-forge h-1.5 w-1.5 rounded-full" />
                Powered by Llama 3.3 70B · Groq
              </span>
              <span>·</span>
              <span>Avg 3 sec</span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {submitting ? (
            <div className="mt-6 grid gap-2">
              {PHASES.map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-md border px-4 py-2.5 text-sm transition-colors ${
                    i < phase
                      ? "border-zinc-200 bg-white text-zinc-500"
                      : i === phase
                        ? "border-forge/30 bg-forge-soft text-zinc-900"
                        : "border-zinc-200 bg-white text-zinc-400"
                  }`}
                >
                  {i < phase ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : i === phase ? (
                    <Loader2 className="text-forge h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                  )}
                  {label}
                </div>
              ))}
            </div>
          ) : null}

          {/* Tip cards */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <TipCard
              icon={Info}
              eyebrow="Tip"
              title="Speaker labels help."
              body={
                <>
                  Lines like{" "}
                  <span className="rounded bg-zinc-100 px-1 font-mono">
                    Marcus:
                  </span>{" "}
                  dramatically improve assignee matching.
                </>
              }
            />
            <TipCard
              icon={Shield}
              eyebrow="Privacy"
              title="Nothing is stored."
              body="Transcripts are processed in-memory and discarded after the run."
            />
            <TipCard
              icon={Zap}
              eyebrow="Shortcut"
              title={
                <>
                  Press <Kbd>⌘</Kbd> <Kbd>↵</Kbd> to extract.
                </>
              }
              body={
                <>
                  Or paste with <Kbd>⌘</Kbd> <Kbd>V</Kbd> — we auto-detect
                  transcript format.
                </>
              }
            />
          </div>
        </main>
      </div>
    </>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ToolbarBtn({
  icon: Icon,
  label,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-zinc-200" />;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[11px] leading-none text-zinc-700 shadow-[0_1px_0_#e5e7eb]">
      {children}
    </span>
  );
}

function TipCard({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Icon className="h-3.5 w-3.5" /> {eyebrow}
      </div>
      <div className="mt-1.5 text-sm font-medium text-zinc-800">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-zinc-600">{body}</div>
    </div>
  );
}

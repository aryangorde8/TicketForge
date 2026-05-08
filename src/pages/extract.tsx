import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
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
import { Atmosphere, useMagnet, useReveal } from "@/components/atmosphere";
import { Meta } from "@/components/meta";
import { SiteHeader } from "@/components/site-header";
import { SAMPLE_SCENARIOS, SAMPLE_TRANSCRIPT } from "@/lib/sample-transcript";
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

  useReveal();
  useMagnet();

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
      <Meta
        title="Extract"
        path="/extract"
        description="Paste a meeting transcript or record live audio. We'll extract action items with confidence scores, source quotes, and assignee matches in seconds."
      />
      <SiteHeader variant="app" step="paste" showAvatar />

      <div style={{ position: "relative", padding: "64px 0 96px" }}>
        <Atmosphere opacity={0.35} style={{ height: 480, top: 0 }} />

        <div className="relative z-[2] mx-auto max-w-[1200px] px-7">
          {/* Timeline */}
          <div className="timeline-strip reveal" style={{ marginBottom: 36 }}>
            <span className="tl-step active">
              <span className="num">01</span> Paste transcript
            </span>
            <span className="tl-sep">›</span>
            <span className="tl-step">
              <span className="num">02</span> Extract
            </span>
            <span className="tl-sep">›</span>
            <span className="tl-step">
              <span className="num">03</span> Review
            </span>
            <span className="tl-sep">›</span>
            <span className="tl-step">
              <span className="num">04</span> Push to Linear
            </span>
          </div>

          <div className="reveal" style={{ maxWidth: 720 }}>
            <h1 className="display display-lg">
              Paste your{" "}
              <span className="serif-italic" style={{ color: "var(--ink)" }}>
                meeting
              </span>{" "}
              transcript.
            </h1>
            <p className="lede" style={{ marginTop: 18 }}>
              We&apos;ll extract action items, assignees, priorities, and due dates — every item
              linked back to the exact line it came from.
            </p>
          </div>

          {/* Card */}
          <div className="reveal" style={{ marginTop: 40 }}>
            <div className="surface-card overflow-hidden" style={{ boxShadow: "var(--shadow-3)" }}>
              {/* Toolbar */}
              <div
                className="flex items-center justify-between"
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderBottom: "1px solid var(--line)",
                  background: "var(--bg-quiet)",
                }}
              >
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
                      className="btn"
                      style={{
                        fontSize: 12,
                        padding: "6px 10px",
                        background: "linear-gradient(180deg,#6b77dc 0%,#5e6ad2 100%)",
                        color: "#fff",
                        boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 10px -4px rgba(94,106,210,0.5)",
                      }}
                    >
                      <Mic className="h-3 w-3" />
                      Record meeting
                    </button>
                  )}
                  <ToolbarDivider />
                  <ToolbarBtn icon={Upload} label="Upload .txt / .vtt" disabled />
                  <ToolbarDivider />
                  <ToolbarBtn icon={LinkIcon} label="Paste from URL" disabled />
                  <ToolbarDivider />
                  <ToolbarBtn icon={Settings2} label="Settings" disabled />
                </div>
                <div className="flex items-center gap-2 mono text-[11px]" style={{ color: "var(--muted-2)" }}>
                  <Lock className="h-3 w-3" />
                  Private to you
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  "Paste the transcript here — Zoom auto-transcript, Otter export, Notion meeting notes, anything readable.\n\nSpeaker labels like Marcus: dramatically improve assignee matching."
                }
                disabled={submitting}
                className="mono w-full resize-none border-0 bg-transparent focus:outline-none"
                style={{
                  minHeight: 380,
                  padding: "22px 28px",
                  fontSize: 13.5,
                  lineHeight: 1.95,
                  color: "var(--ink-2)",
                  background: "transparent",
                }}
              />

              {/* Footer toolbar */}
              <div
                className="flex flex-wrap items-center justify-between gap-2"
                style={{
                  minHeight: 44,
                  padding: "8px 14px",
                  borderTop: "1px solid var(--line)",
                  background: "var(--bg-quiet)",
                }}
              >
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--forge)" }} />
                  <span className="font-medium" style={{ color: "var(--ink-2)" }}>
                    Try an example:
                  </span>
                  {SAMPLE_SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTranscript(s.transcript)}
                      disabled={submitting}
                      title={s.description}
                      className="rounded-md px-2 py-0.5 font-medium transition hover:opacity-80 disabled:opacity-50"
                      style={{
                        border: "1px solid var(--line-2)",
                        background: "var(--bg-elev)",
                        color: "var(--ink-2)",
                      }}
                    >
                      <span className="mr-1">{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="mono text-[11px]" style={{ color: "var(--muted-2)" }}>
                  <span style={{ color: "var(--ink-2)" }}>{transcript.length.toLocaleString()}</span>{" "}
                  / 25,000 chars
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExtract}
              disabled={submitting || !transcript.trim()}
              className="btn btn-primary btn-lg magnet"
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
                  <span className="kbd">⌘ ↵</span>
                </>
              )}
            </button>
            <button
              onClick={() => setTranscript("")}
              disabled={submitting || !transcript}
              className="btn btn-secondary btn-lg magnet"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </button>
            <span className="badge-live ml-auto">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--forge)" }}
                aria-hidden
              />
              Powered by Llama 3.3 70B · Groq · avg 3 sec
            </span>
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
                  className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors`}
                  style={{
                    border: "1px solid var(--line)",
                    background: i === phase ? "var(--forge-soft)" : "var(--bg-elev)",
                    color: i < phase ? "var(--muted)" : i === phase ? "var(--ink)" : "var(--muted-2)",
                  }}
                >
                  {i < phase ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : i === phase ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--forge)" }} />
                  ) : (
                    <span className="h-2 w-2 rounded-full" style={{ background: "var(--line-2)" }} />
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
                  Lines like <span className="mono rounded px-1" style={{ background: "var(--bg-quiet)" }}>Marcus:</span>{" "}
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
                  Press <span className="kbd">⌘</span> <span className="kbd">↵</span> to extract.
                </>
              }
              body={
                <>
                  Or paste with <span className="kbd">⌘</span> <span className="kbd">V</span> — we
                  auto-detect transcript format.
                </>
              }
            />
          </div>
        </div>
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
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
      style={{ color: "var(--ink-2)" }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px" style={{ background: "var(--line-2)" }} />;
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
    <div className="surface-card" style={{ padding: 16 }}>
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
        <Icon className="h-3.5 w-3.5" /> {eyebrow}
      </div>
      <div className="mt-1.5 text-sm font-medium" style={{ color: "var(--ink)" }}>
        {title}
      </div>
      <div className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
        {body}
      </div>
    </div>
  );
}

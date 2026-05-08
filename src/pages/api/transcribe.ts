import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

export const config = {
  api: {
    bodyParser: { sizeLimit: "25mb" },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { audio, mimeType } = req.body as { audio?: string; mimeType?: string };

  if (!audio) {
    return res.status(400).json({ error: "Audio data required" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not set" });
  }

  try {
    const buffer = Buffer.from(audio, "base64");
    const ext = mimeType?.includes("webm") ? "webm" : mimeType?.includes("mp4") ? "mp4" : "wav";
    const file = new File([new Uint8Array(buffer)], `recording.${ext}`, {
      type: mimeType || "audio/webm",
    });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      temperature: 0,
    });

    return res.status(200).json({
      text: transcription.text,
      duration: (transcription as { duration?: number }).duration ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return res.status(500).json({ error: message });
  }
}

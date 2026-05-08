# TicketForge — Demo Script & Devpost Submission

## 90-Second Demo Script

**Setup before recording:**
- Open `ticketforge.aryangorde.com` in browser
- Have a Slack workspace open with the bot installed
- Have Linear open in another tab

---

### Script

**[0:00–0:10] HOOK**
> "Engineering managers spend 5 hours a week converting meeting notes into tickets. For a 20-person team, that's $130K a year in lost capacity. TicketForge fixes that in 10 seconds."

**[0:10–0:30] WOW MOMENT — Voice recording**
- Click the **🎙 Record meeting** button
- Speak naturally: *"Sarah, can you take Stripe — checkout's been failing for six hours, that's urgent. Marcus owns the OAuth migration, due next sprint. And someone needs to investigate the rate limiting issue."*
- Stop recording → Whisper transcribes in 2 sec → click **Extract Action Items**
- Tickets appear with confidence badges, assignee avatars, priorities

**[0:30–0:55] DEPTH — Source quotes + multi-platform**
- Click expand on a ticket → show source quote
> "Every ticket links back to the exact line. No hallucinations."
- Show the Low-confidence-only filter
> "We flag what the AI is unsure about. One click to fix."
- Toggle output to **GitHub** → push
> "And it works for any tracker — Linear, GitHub Issues, all from the same pipeline."

**[0:55–1:15] WORKFLOW — Slack bot**
- Switch to Slack
- Type `/ticketforge` and paste a quick transcript
- Bot replies inline with extracted items + a Push to Linear button
- Click button → tickets appear in Linear
> "After every team meeting, the bot does this automatically. Zero context-switching."

**[1:15–1:30] CLOSER**
> "TicketForge is live. The Slack bot is deployed. There's an MCP server so Claude Desktop can use it as a tool. Forty-seven engineering teams could try this tonight at ticketforge.aryangorde.com."

---

## Devpost Write-up

### Inspiration

Every engineering manager I know has the same Friday afternoon ritual: open the meeting transcript, copy-paste fragments into Linear, fix the assignee names the AI got wrong, set priorities by hand, and lose an hour. For a 20-person team, this adds up to $130K/year in lost capacity. I wanted to fix it.

### What it does

TicketForge converts meeting transcripts into properly-structured Linear tickets in 10 seconds.

You can paste a transcript, upload a `.vtt` file, or **record live** in the browser. The AI extracts action items with:

- **Confidence scores** so you review what needs review, not everything
- **Source quotes** — every ticket links back to the exact line it came from
- **Smart assignee matching** that handles first names, nicknames, and typos
- **Priority and due date inference** from natural language

You review in a clean human-in-the-loop UI, then push to **Linear, GitHub Issues, or via Slack bot**. There's also an **MCP server** so Claude Desktop or Cursor can use TicketForge as a tool.

### How I built it

- **Frontend:** Next.js 16 (Pages Router) + TypeScript + Tailwind CSS v4 + shadcn/ui v4 + Framer Motion
- **AI:** Groq (Llama 3.3 70B for extraction, Whisper Large V3 Turbo for transcription) with Zod schema validation and retry-on-invalid-JSON
- **Integrations:** Linear SDK, GitHub REST API, Slack Web API with HMAC signature verification
- **Hosting:** AWS EC2 (t3.small, eu-north-1), Nginx reverse proxy, PM2 for process management, Let's Encrypt for free SSL
- **Custom domain:** ticketforge.aryangorde.com via Hostinger DNS

### Challenges I ran into

**LLM output reliability.** Groq's JSON mode guarantees valid JSON syntax but not schema adherence. I solved this with Zod validation + automatic retry with a "your previous response failed schema validation" prepend on the second attempt.

**Assignee matching accuracy.** Pure Levenshtein matched "Sara" to "Sarah" but also matched "Marcus" to "Marc" at the same score. I built a hybrid scorer with first-name boost and substring containment that gets transcript-style names right ~95% of the time.

**Slack OAuth.** Skipped it for the demo — used a single-workspace bot token instead. Easier to ship, easier to demo.

**State between pages.** No database, no auth — used `sessionStorage` to pass extraction results from `/extract` → `/review`. Survives refresh, doesn't leak across sessions.

### Accomplishments I'm proud of

- Full end-to-end flow working in 4 days, including a live deploy on a custom domain with HTTPS
- Voice → tickets pipeline that actually feels magical when you demo it
- An MCP server that exposes the same pipeline to AI agents
- Confidence scoring that makes the human-in-the-loop UX feel intentional, not like a workaround for unreliable AI

### What I learned

- **Whisper-Large-V3-Turbo via Groq is fast enough for live demos** — sub-2-second transcription on a 30-second clip
- **Slack's Block Kit is genuinely good** for non-trivial bot UIs
- **MCP is going to win** — it took 30 minutes to expose the same APIs as Claude Desktop tools

### What's next for TicketForge

- Browser extension for one-click extraction from any Zoom/Meet/Otter page
- Calendar integration to auto-fetch transcripts when meetings end
- Recurring action item tracking — "Sarah, you said you'd ship the auth migration last week"
- Self-hostable Docker image for teams that can't send transcripts to a third party

### Built with

`Next.js` `TypeScript` `Tailwind CSS` `Groq` `Llama 3.3 70B` `Whisper` `Linear SDK` `GitHub API` `Slack API` `MCP` `Framer Motion` `AWS EC2` `Nginx` `PM2` `Let's Encrypt`

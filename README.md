# TicketForge

Convert meeting transcripts into properly-structured Linear tickets in seconds.

**Live demo:** [ticketforge.aryangorde.com](https://ticketforge.aryangorde.com)

## What it does

Engineering managers spend 4–6 hours per week converting meeting notes into tickets. For a 20-person team, that's $130K/year in lost capacity. TicketForge fixes this:

1. **Paste, upload, or record** a meeting transcript
2. **AI extracts** action items with confidence scores, source quotes, and assignee matches
3. **Review and edit** in a clean human-in-the-loop UI
4. **Push to Linear, GitHub Issues, or via Slack bot**

## Differentiators

- **Confidence scoring** — every extraction comes with a 0–1 score so humans review what needs review, not everything
- **Source quotes** — every ticket links back to the exact line in the transcript. No hallucinations.
- **Smart assignee matching** — Levenshtein + first-name boost matches "marcus" to "Marcus Chen" at 88%
- **Smart deduplication** — checks Linear for existing similar tickets before creating new ones
- **Multi-platform output** — Linear, GitHub Issues, Slack
- **MCP server** — exposes the pipeline as Model Context Protocol tools for Claude Desktop, Cursor

## Stack

- **Next.js 16** (Pages Router) + TypeScript + Tailwind CSS v4
- **Groq** (Llama 3.3 70B + Whisper Large V3 Turbo) for extraction and transcription
- **Zod** for structured output validation with retry
- **Linear SDK**, GitHub REST API, Slack Web API
- **Framer Motion** for animations
- Hosted on AWS EC2 (t3.small) with Nginx + PM2 + Let's Encrypt SSL

## Local setup

```bash
git clone https://github.com/aryangorde8/TicketForge.git
cd TicketForge
npm install
cp .env.local.example .env.local
# Fill in GROQ_API_KEY and LINEAR_API_KEY
npm run dev
```

### Optional integrations

```bash
# GitHub Issues
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo

# Slack bot
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
TICKETFORGE_URL=https://your-deploy-url.com
```

## Slack bot setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add slash command `/ticketforge` pointing to `https://YOUR_URL/api/slack/command`
3. Add interactivity URL `https://YOUR_URL/api/slack/interact`
4. Add bot scopes: `chat:write`, `commands`
5. Install to workspace, copy bot token + signing secret to env vars
6. Use it: `/ticketforge <paste transcript>`

## MCP server

For Claude Desktop integration, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ticketforge": {
      "command": "node",
      "args": ["/absolute/path/to/scripts/mcp-server.mjs"],
      "env": { "TICKETFORGE_URL": "https://ticketforge.aryangorde.com" }
    }
  }
}
```

Tools exposed: `extract_action_items`, `push_to_linear`, `push_to_github`.

## License

MIT

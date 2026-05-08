#!/usr/bin/env node
/**
 * TicketForge MCP server — exposes the extraction + push pipeline as
 * Model Context Protocol tools for Claude Desktop, Cursor, and friends.
 *
 * Run with: npx @modelcontextprotocol/inspector node scripts/mcp-server.mjs
 * Or wire into Claude Desktop's claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "ticketforge": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/scripts/mcp-server.mjs"],
 *         "env": { "TICKETFORGE_URL": "https://ticketforge.aryangorde.com" }
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.TICKETFORGE_URL ?? "https://ticketforge.aryangorde.com";

const server = new Server(
  { name: "ticketforge", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "extract_action_items",
      description:
        "Extract action items from a meeting transcript. Returns a list of tickets with title, assignee hint, priority, due date, confidence score, and the source quote.",
      inputSchema: {
        type: "object",
        properties: {
          transcript: {
            type: "string",
            description: "Raw meeting transcript text. Speaker labels like 'Marcus:' improve assignee matching.",
          },
        },
        required: ["transcript"],
      },
    },
    {
      name: "push_to_linear",
      description:
        "Create Linear issues from a list of action items. Each item must have a title, description, priority (urgent|high|medium|low), and optional assignee_user_id.",
      inputSchema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Action items to push as Linear issues.",
          },
        },
        required: ["items"],
      },
    },
    {
      name: "push_to_github",
      description:
        "Create GitHub issues from a list of action items. Repo configured server-side via GITHUB_OWNER and GITHUB_REPO env vars.",
      inputSchema: {
        type: "object",
        properties: {
          items: { type: "array", description: "Action items to push." },
        },
        required: ["items"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "extract_action_items") {
    const res = await fetch(`${BASE_URL}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: args.transcript }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Extract failed: ${res.status}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }

  if (name === "push_to_linear" || name === "push_to_github") {
    const destination = name === "push_to_linear" ? "linear" : "github";
    const res = await fetch(`${BASE_URL}/api/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: args.items, destination }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Push failed: ${res.status}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data.created, null, 2) }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("TicketForge MCP server running on stdio");

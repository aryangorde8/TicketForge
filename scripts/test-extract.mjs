// Smoke test for /lib/extract.ts. Requires GROQ_API_KEY in .env.local.
// Run: node --env-file=.env.local --experimental-strip-types scripts/test-extract.mjs
//   or: npx tsx scripts/test-extract.mjs (after `npm i -D tsx`)

import { extractActionItems } from "../src/lib/extract.ts";

const SAMPLE = `[Engineering Standup, May 7]
Aryan: Quick update — the payment gateway timeout issue is still happening intermittently. I'm going to dig into the Stripe logs today and have a fix by end of week.
Priya: Sounds good. We need that resolved before the launch on the 15th, that's a blocker.
Marcus: I can take the OAuth2 migration off the backlog. Should I aim for next sprint?
Priya: Yeah, next sprint works. High priority but not urgent.
Aryan: One more thing — we should probably look into rate limiting on the public API at some point. Not urgent though.
Priya: Agreed, let's keep it on the radar. Marcus, can you also update the onboarding emails by Friday? Legal flagged some compliance language.
Marcus: Will do, Friday is fine.
Priya: Great. Last thing — we decided to deprecate the v1 API endpoints by end of Q3. I'll send a migration notice to customers next week.`;

const result = await extractActionItems(SAMPLE);
console.log(JSON.stringify(result, null, 2));

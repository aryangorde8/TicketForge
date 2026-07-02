"""Built-in sample transcripts — port of `src/lib/sample-transcript.ts`."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SampleScenario:
    id: str
    label: str
    description: str
    emoji: str
    transcript: str


ENGINEERING_STANDUP = """[Engineering Standup, May 7]
Aryan: Quick update — the payment gateway timeout issue is still happening intermittently. I'm going to dig into the Stripe logs today and have a fix by end of week.
Priya: Sounds good. We need that resolved before the launch on the 15th, that's a blocker.
Marcus: I can take the OAuth2 migration off the backlog. Should I aim for next sprint?
Priya: Yeah, next sprint works. High priority but not urgent.
Aryan: One more thing — we should probably look into rate limiting on the public API at some point. Not urgent though.
Priya: Agreed, let's keep it on the radar. Marcus, can you also update the onboarding emails by Friday? Legal flagged some compliance language.
Marcus: Will do, Friday is fine.
Priya: Great. Last thing — we decided to deprecate the v1 API endpoints by end of Q3. I'll send a migration notice to customers next week."""

PRODUCT_PLANNING = """[Q3 Product Planning, May 6]
Sarah: Let's lock the Q3 roadmap today. Top of the list is the analytics dashboard rewrite — customers have been asking for filters and saved views for two quarters.
James: I'll lead that. Can we get a designer assigned by next week? I'd like a clean design before sprint planning.
Sarah: Noted, I'll talk to Priya about getting design support.
James: Second priority is the SAML/SSO support for enterprise. We have three deals blocked on this — Acme, Northwind, and Initech. Can't push past Q3.
Sarah: Agreed, that's urgent. Marcus, can you scope it this week?
Marcus: Yes, I'll have a doc by Thursday.
Sarah: Third — the mobile bug where push notifications drop on iOS 17. Not urgent but it's been open for six weeks. Aryan, can you fix this sprint?
Aryan: I'll take it.
James: One more — let's deprecate the legacy export format. I'll write the migration guide for customers.
Sarah: Perfect. We're shipping the new pricing page next Tuesday — that's already scoped."""

INCIDENT_POSTMORTEM = """[Incident Postmortem — Outage May 5, 14:00 UTC]
Priya: Thanks for joining. Recap: payment processing was down for 47 minutes. Root cause was a Stripe webhook handler that crashed on a malformed payload from a new edge case.
Marcus: We should add input validation on every webhook handler. I'll take that — should be done this week.
Priya: Urgent. Also: our alerting didn't fire until 15 minutes in. Sarah, can you audit the PagerDuty rules?
Sarah: On it. I'll have a report by Monday with proposed changes.
Aryan: We had no playbook for this. I think we need a runbook for "payments down" specifically. I can draft one.
Priya: Yes, please do. Make it the canonical doc. Also — we need to write a customer-facing post-mortem. James, can you handle that by tomorrow EOD?
James: Yeah, I'll get it out.
Priya: Last item — let's add Stripe webhook integration tests in CI. Marcus, group that with your validation work.
Marcus: Will do.
Priya: One decision: we're moving all webhook handlers to the new resilience framework by end of month. No exceptions."""

CUSTOMER_FEEDBACK = """[Customer Success Sync, May 4]
Lena: Three customer requests came up this week. First — Stripe Atlas asked about CSV export with custom date ranges. They're a top-10 account, so this matters. They want it within two weeks.
Sarah: Marcus, can you take that? Should be straightforward.
Marcus: Yes, I'll scope it tomorrow.
Lena: Second — multiple customers reported the dashboard is slow when filtering large date ranges. Notion's CTO emailed me directly. We've gotten this complaint at least five times this month.
James: That's the analytics rewrite work. I can prioritize the perf fix as a quick win before the rewrite. Aim for next week.
Lena: Third — Acme wants SSO. Already in the Q3 plan, just flagging.
Sarah: Got it. One more thing from me — we decided to give all enterprise customers a dedicated Slack channel. Lena, please own the rollout.
Lena: Will do, by end of next week."""

SAMPLE_SCENARIOS: list[SampleScenario] = [
    SampleScenario("standup", "Engineering standup", "Stripe timeout, OAuth migration, onboarding emails", "🛠", ENGINEERING_STANDUP),
    SampleScenario("planning", "Q3 product planning", "Analytics rewrite, SSO, mobile bug", "🗺", PRODUCT_PLANNING),
    SampleScenario("incident", "Incident postmortem", "Payment outage, alerting, runbook", "🚨", INCIDENT_POSTMORTEM),
    SampleScenario("customer", "Customer feedback sync", "CSV export, dashboard perf, SSO", "💬", CUSTOMER_FEEDBACK),
]

# Default sample used by the ?sample=1 deep link.
SAMPLE_TRANSCRIPT = ENGINEERING_STANDUP

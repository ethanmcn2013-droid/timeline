# Phase — Roadmap (public-roadmap product)

Vocabulary: **Cycle N · summary · YYYY-MM-DD**

Each cycle ships one named artifact with a date, a number, and a story-first changelog entry. Same cadence as Tasks.

## Current

Cycle 6 — Public surface · /[workspaceSlug]/* renders someone's roadmap to the world · 2026-05-08
Templates T-2.1a — Plumbing in place (workspaces.template_id + sync script + canonical wedding roadmap.ts reshape) · 2026-05-12.
Templates T-2.1b — Workspaces can now start from a canonical template (createWorkspaceAction accepts fromTemplate, seeds projects + items; new /onboarding/from-template/[id] route) · 2026-05-12. T-2.1c (Tasks-side cross-product CTA) is the next templates cycle.
R·3 — Post-launch audit lands · copy bundle + share moment + security P1s + UI de-slop shipped · 2026-05-15. Workspace-routing refactor (getCurrentWorkspace[0] anchor) held for R·4.
R·4 — Code-review slate · security P0s + perf (React cache, derived counts, batched upsert, ISR) + ClerkProvider scoping (marketing now static) + dead-code purge shipped · 2026-05-15. Composite-FK migration + dead-table drops + 0002 re-run hazard held for a dedicated DB cycle. KNOWN-LIVE: prod has no Upstash env → all rate-limited write paths deny 100% until operator provisions Upstash + redeploys (operator chose to provision rather than soften fail-closed).

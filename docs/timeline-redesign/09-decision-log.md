# Timeline redesign decision log

Current status: Phase 1 unselected
Decision authority: Ethan McNamara
Production implementation: blocked by the explicit selection gate

## 2026-07-18: Phase 1 review package

Three coded directions were prepared for review:

- Option A: Quiet Direction Ledger
- Option B: Editorial Plan Room
- Option C: Signal Horizon

The options share one fixture state contract and cover owner plan, public timeline, shared update, and item detail. They are isolated review directions. No option is selected by its score, recommendation, branch status, deployment status, or visual similarity to production.

Decision: **Pending**

Production routes and production data remain unchanged during Phase 1.

## Valid selection commands

The decision must use one of these exact commands:

```text
SELECT A — Quiet Direction Ledger
SELECT B — Editorial Plan Room
SELECT C — Signal Horizon
SELECT HYBRID — followed by the exact components to combine
```

The em dash in these commands is part of the locked selection protocol and is the only exception to the public-copy punctuation guidance.

## Hybrid recording rule

A hybrid selection must identify each surface or bounded component. Examples of sufficient specificity include:

- `A owner ledger + B public timeline + B shared update + A detail sheet`
- `A owner interaction grammar + C public horizon + B shared update + C detail inspector`
- `B purpose header and change margin inside A owner ledger`

Phrases such as `mostly B`, `A with C styling`, or `take the best parts` are not implementation decisions because they do not preserve a testable structure.

## What selection authorises

Selection authorises Phase 2 implementation planning and production work for the named direction. It does not waive production requirements for canonical data mapping, privacy projection, publication snapshots, anonymous access, source tracking, responsive behaviour, accessibility, performance, migration safety, verification, rollback, HQ updates, changelog, or deployment evidence.

## Next log entry

After explicit selection, append:

- exact selection command;
- selected surfaces and components;
- decision date and rationale;
- rejected alternatives and relevant tradeoffs;
- Phase 2 branch, pull request, deployment, and rollback references;
- production verification receipts.

Until that entry exists, Phase 2 must not replace owner, public, update, or detail routes.

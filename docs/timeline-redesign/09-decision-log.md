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

## Review endpoints and deployment receipt

Local review base: `http://127.0.0.1:4320/__design-lab/timeline`

Protected preview base: `https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline`

Deployment: `dpl_3W6krhr15HicXNWQ5bSkNDxMDFyH`, Vercel Preview, READY, Vercel Authentication scoped to Preview deployments. The deployed source is commit `76998f1` on `feat/timeline-world-class-design-lab`.

| Direction | Surface | Local | Protected preview |
| --- | --- | --- | --- |
| A | Owner plan | [Open local A owner](http://127.0.0.1:4320/__design-lab/timeline?option=a&surface=owner&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected A owner](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=a&surface=owner&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| A | Public timeline | [Open local A public](http://127.0.0.1:4320/__design-lab/timeline?option=a&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected A public](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=a&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| A | Shared update | [Open local A update](http://127.0.0.1:4320/__design-lab/timeline?option=a&surface=update&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected A update](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=a&surface=update&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| A | Item detail | [Open local A detail](http://127.0.0.1:4320/__design-lab/timeline?option=a&surface=detail&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected A detail](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=a&surface=detail&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| B | Owner plan | [Open local B owner](http://127.0.0.1:4320/__design-lab/timeline?option=b&surface=owner&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected B owner](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=b&surface=owner&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| B | Public timeline | [Open local B public](http://127.0.0.1:4320/__design-lab/timeline?option=b&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected B public](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=b&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| B | Shared update | [Open local B update](http://127.0.0.1:4320/__design-lab/timeline?option=b&surface=update&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected B update](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=b&surface=update&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| B | Item detail | [Open local B detail](http://127.0.0.1:4320/__design-lab/timeline?option=b&surface=detail&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected B detail](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=b&surface=detail&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| C | Owner plan | [Open local C owner](http://127.0.0.1:4320/__design-lab/timeline?option=c&surface=owner&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected C owner](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=c&surface=owner&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| C | Public timeline | [Open local C public](http://127.0.0.1:4320/__design-lab/timeline?option=c&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected C public](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=c&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| C | Shared update | [Open local C update](http://127.0.0.1:4320/__design-lab/timeline?option=c&surface=update&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected C update](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=c&surface=update&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |
| C | Item detail | [Open local C detail](http://127.0.0.1:4320/__design-lab/timeline?option=c&surface=detail&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) | [Open protected C detail](https://roadmap-m7f3csrq3-ethanmcn2013-1730s-projects.vercel.app/__design-lab/timeline?option=c&surface=detail&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working) |

The protected links require authorised Vercel access. The lab route still returns not found on Vercel Production even if all three review flags are present.

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

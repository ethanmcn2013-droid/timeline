# Timeline redesign decision log

Current status: Option D selected; production integration in progress
Decision authority: Ethan McNamara
Production implementation: authorised; deployment evidence pending

## 2026-07-22: Option D selected

Founder decision: **SELECT D — The Current**.

Ethan's explicit instruction to "lock in on option d" closes the selection
gate. Option D was added during the live review after the original A/B/C package,
so the founder's plain-language selection is the authority even though the first
protocol did not yet list D.

### Selected production composition

- The shared artefact is one horizontal, date-aware line with milestones as
  points and completion visible in the line itself.
- A separate vertical `Today` dash shows the real calendar position between
  milestones.
- The first unfinished milestone reads `Our next milestone`.
- The upper-right time lens switches between exact milestone completion and
  days remaining to the primary date with restrained, reduced-motion-safe
  motion.
- Selecting a point reveals its detail in place. Hover is an enhancement;
  focus, click, Enter, Space, and touch must expose the same content.
- The private owner route presents the same artefact at full size and in a
  real phone frame. Owner previews do not count as views.
- The bearer-link recipient route has no black operating rail, no owner tools,
  no public directory, and no indexable discovery path.
- A qualified view is recorded only after two seconds of continuous visibility,
  deduplicated at publication level, and shown only to the owner as views rather
  than people.

The selected implementation uses the existing frozen `AudienceTimelineDto`
allowlist. It does not introduce a second public data interpretation. The
`covered / now / next / later / cancelled` states become complete, next, future,
future, and excluded-planning-decision treatments respectively. Completion is
`covered / all non-cancelled milestones`; it is never confidence.

### Rejected directions and tradeoffs

- A retained useful restraint and the compact completion fact, but read as a
  ledger rather than a project journey.
- B retained useful editorial warmth, but its document hierarchy delayed the
  at-a-glance progress read.
- C retained useful spatial hierarchy, but carried more interface structure
  than the shared artefact needs.
- D is selected because the line itself communicates progress, timing, and the
  next milestone before the viewer reads supporting copy.

### Production record

- Unified-app implementation: `tasks` branch `feat/timeline-artifact`.
- Qualified-view schema record: `roadmap` branch
  `feat/timeline-qualified-views`.
- Pull requests: pending.
- Database migration receipt: pending.
- Production deployment: pending.
- Live owner, phone-preview, bearer-link, privacy-header, and qualified-view
  verification: pending.
- Rollback reference: pending release commit and migration receipt.

No line in this entry is deployment evidence. The status must remain pending
until those receipts are replaced with concrete references.

## 2026-07-18: Phase 1 review package

Three coded directions were prepared for review:

- Option A: Quiet Direction Ledger
- Option B: Editorial Plan Room
- Option C: Signal Horizon

The options share one fixture state contract and cover owner plan, public timeline, shared update, and item detail. They are isolated review directions. No option in this original package was selected by its score, recommendation, branch status, deployment status, or visual similarity to production.

Decision at package close: **Pending**. Superseded by the Option D selection on
2026-07-22.

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

Option D was reviewed in the later local lab at
`http://127.0.0.1:4320/__design-lab/timeline?option=d&surface=public&dataset=wedding&density=normal&state=default&viewport=responsive&preview=working&presentation=product`.
It has no protected-preview or production deployment receipt in this record.

## Valid selection commands

The decision must use one of these exact commands:

```text
SELECT A — Quiet Direction Ledger
SELECT B — Editorial Plan Room
SELECT C — Signal Horizon
SELECT D — The Current
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

After production release, append:

- merged pull request and release commit;
- migration dry-run and production receipts;
- deployment and rollback references;
- live owner and shared-route verification;
- privacy, accessibility, reduced-motion, and qualified-view receipts.

Until that entry exists, Option D is selected but not recorded as deployed.

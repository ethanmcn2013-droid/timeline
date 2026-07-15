## What changed

<!-- Lead with the user-visible outcome and name the affected experience IDs. -->

## Experience quality checklist

- [ ] Every added, removed, or moved route is reflected in `experience/registry.json`.
- [ ] Material source-hash changes include complete fixture, screenshot, accessibility, review-date, and approved-baseline evidence.
- [ ] Required states were exercised, including empty/loading/error/long-content where applicable.
- [ ] Mobile (390), tablet (768), desktop (1280), and wide (1440) layouts were reviewed.
- [ ] Keyboard order, focus visibility, modal focus containment, and return focus were verified.
- [ ] Screen-reader names, roles, relationships, and status announcements were verified.
- [ ] Reduced-motion behavior was reviewed.
- [ ] Signal Design System tokens and established components were used; intentional exceptions are documented.
- [ ] Browser console and failed network requests were reviewed.

## Evidence

<!-- Link screenshots, audit records, findings, tests, and approved baselines. -->

- Experience IDs:
- States and breakpoints:
- Screenshot or audit references:
- Accessibility evidence:
- Intentional exceptions:

## Verification

- [ ] `node scripts/experience/self-test.mjs`
- [ ] `node scripts/experience/validate.mjs`
- [ ] `corepack pnpm typecheck`
- [ ] Focused tests
- [ ] `corepack pnpm build`
- [ ] `git diff --check`

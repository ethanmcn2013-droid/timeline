# Timeline experience registry

`registry.json` is Timeline's repository-local shard of Signal Studio's
`signal-experience/1` contract. It uses the suite's stable experience IDs,
state vocabulary, owners, and four required breakpoints while keeping source
paths resolvable in this standalone repository.

Run the blocking checks from the repository root:

```text
node scripts/experience/self-test.mjs
node --test scripts/experience/shortcuts-dialog.test.mjs
node --test scripts/experience/reserved-slugs.test.mjs
node scripts/experience/validate.mjs
```

The validator discovers App Router `page`, `loading`, `error`, and `not-found`
files. It rejects unregistered routes, obsolete registrations, duplicate IDs
or page routes, broken or moved sources, invalid schema values, and stale
materiality hashes.

Materiality hashes are SHA-256 source hashes truncated to 16 characters after
normalizing line endings to LF. In pull-request CI, changing a checked-in hash
relative to the base branch also requires complete fixture, screenshot, and
accessibility coverage plus a review date and a new approved baseline
reference. The checked-in hash must always match the current source. This
prevents either stale evidence or a regenerated hash from bypassing review.

Non-route experiences remain explicit registry entries with a `trigger` and a
real source file. Add a stable entry whenever a new dialog, drawer, menu,
embedded workspace, or other material surface is introduced.

Review receipts live in `experience/evidence/`. Evidence records identify the
fixture boundary, exact viewport and motion settings, route and accessibility
assertions, generated artifact paths, and SHA-256 screenshot digests. Coverage
in the registry stays partial until every required state and breakpoint is
represented; a single polished happy-path capture is not treated as complete.

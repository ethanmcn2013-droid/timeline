/**
 * test-parser.ts — manual fixture runner for the markdown parser.
 *
 * Run: npx tsx scripts/test-parser.ts
 *
 * Prints parsed items as JSON, then a summary by status.
 * Expected: 7 items from the fixture below.
 *
 * v1 known limitation: reordering items in markdown shifts ords,
 * which shifts IDs and loses any UI-set state for moved items.
 */

import { parseMarkdown } from "../src/server/parser/parse-markdown";

const FIXTURE = `
# My Roadmap

## Q3 2026

- [ ] Brand refresh — kicked off, designer on it (2026-08-15)
- [/] New website — content writing in progress
- [x] Tax return for 2025 — done, no audit, painless

## Won't do this year

- [-] Open a second studio space
- [-] Rebrand the logo (clients still recognize it)

## Coming soon

- [!] Renew domain — credit card expired
- [ ] Hire a junior designer
`;

const result = parseMarkdown({
  rawMarkdown: FIXTURE,
  workspaceSlug: "test-ws",
  projectSlug: "test-proj",
});

console.log("=== Parsed items ===\n");
console.log(JSON.stringify(result.items, null, 2));

if (result.parseError) {
  console.error("\nParse error:", result.parseError);
}

// Summary
const counts: Record<string, number> = {};
for (const item of result.items) {
  counts[item.status] = (counts[item.status] ?? 0) + 1;
}

console.log("\n=== Summary ===");
console.log(`Total items: ${result.items.length} (expected 7)`);
console.log("By status:", counts);

const kindCounts: Record<string, number> = {};
for (const item of result.items) {
  kindCounts[item.kind] = (kindCounts[item.kind] ?? 0) + 1;
}
console.log("By kind:", kindCounts);

// Quick assertions
const expected = [
  { status: "next", title: "Brand refresh", targetDate: "2026-08-15", weekHeading: "Q3 2026" },
  { status: "in-flight", title: "New website", targetDate: null, weekHeading: "Q3 2026" },
  { status: "shipped", title: "Tax return for 2025", targetDate: null, weekHeading: "Q3 2026" },
  { status: "refused", title: "Open a second studio space", targetDate: null, weekHeading: "Won't do this year" },
  // No "—" or ":" separator in this bullet, so the parenthetical stays in the title — correct parser behavior.
  { status: "refused", title: "Rebrand the logo (clients still recognize it)", targetDate: null, weekHeading: "Won't do this year" },
  { status: "blocked", title: "Renew domain", targetDate: null, weekHeading: "Coming soon" },
  { status: "next", title: "Hire a junior designer", targetDate: null, weekHeading: "Coming soon" },
];

console.log("\n=== Assertions ===");
let pass = 0;
let fail = 0;
expected.forEach((exp, i) => {
  const item = result.items[i];
  if (!item) {
    console.error(`FAIL item[${i}]: missing`);
    fail++;
    return;
  }
  const statusOk = item.status === exp.status;
  const titleOk = item.title === exp.title;
  const dateOk = item.targetDate === exp.targetDate;
  const headingOk = item.weekHeading === exp.weekHeading;
  if (statusOk && titleOk && dateOk && headingOk) {
    console.log(`PASS item[${i}]: "${exp.title}" (${exp.status})`);
    pass++;
  } else {
    console.error(`FAIL item[${i}]:`);
    if (!statusOk) console.error(`  status: got "${item.status}", want "${exp.status}"`);
    if (!titleOk) console.error(`  title: got "${item.title}", want "${exp.title}"`);
    if (!dateOk) console.error(`  targetDate: got "${item.targetDate}", want "${exp.targetDate}"`);
    if (!headingOk) console.error(`  weekHeading: got "${item.weekHeading}", want "${exp.weekHeading}"`);
    fail++;
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);

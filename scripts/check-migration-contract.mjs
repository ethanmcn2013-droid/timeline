import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (!/^drizzle-kit\s+migrate$/.test(String(pkg.scripts?.["db:migrate"] ?? ""))) {
  console.error("migration-contract: db:migrate must use drizzle-kit migrate");
  process.exit(1);
}
if (/drizzle-kit\s+push/.test(String(pkg.scripts?.dev ?? ""))) {
  console.error("migration-contract: dev must not run drizzle-kit push");
  process.exit(1);
}
if (
  pkg.scripts?.["db:qualified-views"] !==
  "tsx scripts/timeline-qualified-view-release.mts"
) {
  console.error("migration-contract: qualified-view operator script is missing");
  process.exit(1);
}
const journal = JSON.parse(
  fs.readFileSync("drizzle/meta/_journal.json", "utf8"),
);
const expectedTags = [
  "0000_parallel_pestilence",
  "0001_drop_isPublic_shareToken",
  "0002_workspace_owner_template",
  "0003_workspace_is_demo",
  "0004_add_published_at",
  "0005_add_nodeOverlays_sourceTasksWorkspaceId",
  "0006_rename_status_blocked_to_waiting",
  "0007_audience_timeline_publications",
  "0008_qualified_audience_views",
];
if (
  journal.entries?.length !== expectedTags.length ||
  expectedTags.some((tag, index) => {
    const entry = journal.entries[index];
    return (
      entry?.idx !== index ||
      entry?.tag !== tag ||
      (index > 0 && entry.when <= journal.entries[index - 1].when)
    );
  })
) {
  console.error("migration-contract: journal must be contiguous through 0008");
  process.exit(1);
}
console.log("migration-contract: ok");

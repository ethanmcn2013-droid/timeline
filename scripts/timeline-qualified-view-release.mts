import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  createClient,
  type Client,
  type InValue,
  type ResultSet,
  type Transaction,
} from "@libsql/client";
import { parse as parseDotenv } from "dotenv";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const MIGRATION_PATH = fileURLToPath(
  new URL("../drizzle/0008_qualified_audience_views.sql", import.meta.url),
);
const MIGRATION_0006_PATH = fileURLToPath(
  new URL("../drizzle/0006_rename_status_blocked_to_waiting.sql", import.meta.url),
);
const RECEIPT_PATH = fileURLToPath(
  new URL(
    "../drizzle/receipts/qualified-audience-views-2026-07-22.json",
    import.meta.url,
  ),
);
const JOURNAL_PATH = fileURLToPath(
  new URL("../drizzle/meta/_journal.json", import.meta.url),
);
const SNAPSHOT_SCHEMA_VERSION = "timeline-qualified-view-snapshot/1";
const DRY_RUN_SCHEMA_VERSION = "timeline-qualified-view-dry-run/1";
const APPLIED_RECEIPT_SCHEMA_VERSION = "timeline-qualified-view-applied/1";
const PAGE_SIZE = 500;

type DatabaseExecutor = Pick<Client, "execute"> | Pick<Transaction, "execute">;

type ExpectedProof = {
  id: string;
  sql: string;
  expected: number;
};

type ProofResult = {
  id: string;
  expected: number;
  actual: number;
};

type ProofObservation = {
  id: string;
  expected: number;
  actual: number | null;
  passed: boolean;
};

type StatusReconciliation = {
  tasksUpdated: number;
  nodeOverlaysUpdated: number;
};

type TableCount = {
  table: string;
  rows: number;
};

type MigrationState = "pending" | "applied" | "partial";

type LedgerEntry = {
  idx: number;
  tag: string;
  when: number;
  hash: string;
};

export type SnapshotManifest = {
  schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
  createdAt: string;
  sha256: string;
  bytes: number;
  migration0008State: "pending";
  adoptionProofs: ProofObservation[];
  pendingStatusReconciliation: {
    tasks: number;
    nodeOverlays: number;
  };
  tableCounts: TableCount[];
  integrityCheck: "ok";
  foreignKeyViolations: 0;
};

type DryRunReport = {
  schemaVersion: typeof DRY_RUN_SCHEMA_VERSION;
  createdAt: string;
  sha256: string;
  migrationSha256: string;
  snapshotSha256: string;
  receiptId: string;
  ledgerEntries: number;
  statusReconciliation: StatusReconciliation;
  proofResults: ProofResult[];
  tableCounts: TableCount[];
  integrityCheck: "ok";
  foreignKeyViolations: 0;
};

type AppliedReceipt = {
  schemaVersion: typeof APPLIED_RECEIPT_SCHEMA_VERSION;
  receiptId: string;
  appliedAt: string;
  migrationSha256: string;
  migration0006Sha256: string;
  snapshot: {
    path: string;
    manifestPath: string;
    databaseSha256: string;
    manifestSha256: string;
  };
  dryRun: {
    path: string;
    reportPath: string;
    databaseSha256: string;
    reportSha256: string;
  };
  statusReconciliation: StatusReconciliation;
  finalLedgerLength: number;
  adoptionPostconditions: ProofResult[];
  migrationPostconditions: ProofResult[];
  integrityCheck: "ok";
  foreignKeyViolations: 0;
};

type MigrationReceipt = {
  schemaVersion: string;
  id: string;
  migrations: Array<{
    id: string;
    sha256: string;
    proofs: ExpectedProof[];
  }>;
};

type CliOptions = {
  envPath?: string;
  inspect: boolean;
  snapshotPath?: string;
  receiptPath?: string;
  dryRun: boolean;
  apply: boolean;
  help: boolean;
};

const ADOPTION_PROOFS: ExpectedProof[] = [
  {
    id: "0003-workspace-is-demo-column",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('workspaces') WHERE name = 'is_demo'",
    expected: 1,
  },
  {
    id: "0003-demo-workspace-backfill",
    sql: "SELECT COUNT(*) AS value FROM workspaces WHERE slug = 'tasks' AND is_demo <> 1",
    expected: 0,
  },
  {
    id: "0004-project-published-at-column",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('projects') WHERE name = 'published_at'",
    expected: 1,
  },
  {
    id: "0005-source-workspace-column",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('projects') WHERE name = 'source_tasks_workspace_id'",
    expected: 1,
  },
  {
    id: "0005-node-overlays-table",
    sql: "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name = 'node_overlays'",
    expected: 1,
  },
  {
    id: "0005-node-overlays-index",
    sql: "SELECT COUNT(*) AS value FROM pragma_index_list('node_overlays') WHERE name = 'idx_node_overlays_workspace'",
    expected: 1,
  },
  {
    id: "0006-no-blocked-task-status",
    sql: "SELECT COUNT(*) AS value FROM tasks WHERE status = 'blocked'",
    expected: 0,
  },
  {
    id: "0006-no-blocked-overlay-status",
    sql: "SELECT COUNT(*) AS value FROM node_overlays WHERE manual_status = 'blocked'",
    expected: 0,
  },
  {
    id: "0007-suite-workspace-column",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('workspaces') WHERE name = 'suite_workspace_id'",
    expected: 1,
  },
  {
    id: "0007-suite-workspace-unique-index",
    sql: "SELECT COUNT(*) AS value FROM pragma_index_list('workspaces') WHERE name = 'uq_workspaces_suite_workspace_id' AND \"unique\" = 1",
    expected: 1,
  },
  {
    id: "0007-publication-tables",
    sql: "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name IN ('timeline_publications','timeline_publication_items','audience_shares')",
    expected: 3,
  },
  {
    id: "0007-audience-share-token-is-digest-only",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('audience_shares') WHERE name = 'token_hash'",
    expected: 1,
  },
  {
    id: "0007-no-raw-audience-share-token-column",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('audience_shares') WHERE name IN ('token','share_token','raw_token')",
    expected: 0,
  },
  {
    id: "0007-publication-item-foreign-key",
    sql: "SELECT COUNT(*) AS value FROM pragma_foreign_key_list('timeline_publication_items') WHERE \"table\" = 'timeline_publications' AND \"from\" = 'publication_id' AND on_delete = 'CASCADE'",
    expected: 1,
  },
  {
    id: "0007-audience-share-foreign-key",
    sql: "SELECT COUNT(*) AS value FROM pragma_foreign_key_list('audience_shares') WHERE \"table\" = 'timeline_publications' AND \"from\" = 'publication_id' AND on_delete = 'CASCADE'",
    expected: 1,
  },
  {
    id: "0007-foreign-keys-clean",
    sql: "SELECT COUNT(*) AS value FROM pragma_foreign_key_check",
    expected: 0,
  },
];

const BASE_ADOPTION_PROOFS: ExpectedProof[] = [
  {
    id: "0000-core-tables",
    sql: "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name IN ('activity','comments','project_sources','projects','subtasks','tasks','workspaces')",
    expected: 7,
  },
  {
    id: "0000-core-indexes",
    sql: "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'index' AND name IN ('idx_activity_entity','idx_comments_task','idx_sources_workspace','idx_subtasks_task','idx_tasks_project_status','idx_tasks_assignee','idx_tasks_phase','idx_tasks_kind','idx_tasks_blocker','idx_tasks_workspace_project','idx_workspaces_owner')",
    expected: 11,
  },
  {
    id: "0000-comments-task-foreign-key",
    sql: "SELECT COUNT(*) AS value FROM pragma_foreign_key_list('comments') WHERE \"table\" = 'tasks' AND \"from\" = 'task_id' AND on_delete = 'CASCADE'",
    expected: 1,
  },
  {
    id: "0000-subtasks-task-foreign-key",
    sql: "SELECT COUNT(*) AS value FROM pragma_foreign_key_list('subtasks') WHERE \"table\" = 'tasks' AND \"from\" = 'task_id' AND on_delete = 'CASCADE'",
    expected: 1,
  },
  {
    id: "0001-retired-project-sharing-columns-absent",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('projects') WHERE name IN ('share_token','is_public')",
    expected: 0,
  },
  {
    id: "0002-owner-template-columns",
    sql: "SELECT COUNT(*) AS value FROM pragma_table_info('workspaces') WHERE name IN ('owner_name','owner_email','template_id')",
    expected: 3,
  },
];

const RECONCILIABLE_0006_PROOF_IDS = new Set([
  "0006-no-blocked-task-status",
  "0006-no-blocked-overlay-status",
]);

const ALL_ADOPTION_PROOFS = [
  ...BASE_ADOPTION_PROOFS,
  ...ADOPTION_PROOFS,
];

function canonicalSha256(value: string | Uint8Array): string {
  const normalized =
    typeof value === "string"
      ? value.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n")
      : value;
  return createHash("sha256").update(normalized).digest("hex");
}

function fileSha256(path: string): string {
  return canonicalSha256(readFileSync(path));
}

function rawFileSha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function loadContiguousLedger(): LedgerEntry[] {
  const journal = JSON.parse(readFileSync(JOURNAL_PATH, "utf8")) as {
    entries?: Array<{
      idx?: unknown;
      tag?: unknown;
      when?: unknown;
      version?: unknown;
      breakpoints?: unknown;
    }>;
  };
  if (!Array.isArray(journal.entries) || journal.entries.length !== 9) {
    throw new Error(
      "Drizzle journal must contain exactly the contiguous 0000-0008 release chain.",
    );
  }
  const ledger = journal.entries.map((entry, index) => {
    if (
      entry.idx !== index ||
      entry.version !== "6" ||
      entry.breakpoints !== true ||
      typeof entry.tag !== "string" ||
      !entry.tag.startsWith(`${String(index).padStart(4, "0")}_`) ||
      typeof entry.when !== "number" ||
      !Number.isSafeInteger(entry.when)
    ) {
      throw new Error(`Drizzle journal entry ${index} is not contiguous or valid.`);
    }
    if (index > 0 && entry.when <= Number(journal.entries?.[index - 1]?.when)) {
      throw new Error("Drizzle journal timestamps must be strictly increasing.");
    }
    const migrationPath = fileURLToPath(
      new URL(`../drizzle/${entry.tag}.sql`, import.meta.url),
    );
    if (!existsSync(migrationPath)) {
      throw new Error(`Drizzle journal migration is missing: ${entry.tag}.sql`);
    }
    return {
      idx: index,
      tag: entry.tag,
      when: entry.when,
      hash: rawFileSha256(migrationPath),
    };
  });
  if (ledger.at(-1)?.tag !== "0008_qualified_audience_views") {
    throw new Error("Drizzle journal must end at migration 0008.");
  }
  return ledger;
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function numericValue(result: ResultSet, proofId: string): number {
  const value = result.rows[0]?.value;
  if (typeof value !== "number" && typeof value !== "bigint") {
    throw new Error(`Proof ${proofId} did not return one numeric value.`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new Error(`Proof ${proofId} returned an unsafe integer.`);
  }
  return number;
}

async function runProofs(
  executor: DatabaseExecutor,
  proofs: ExpectedProof[],
  label: string,
): Promise<ProofResult[]> {
  const results: ProofResult[] = [];
  for (const proof of proofs) {
    const actual = numericValue(await executor.execute(proof.sql), proof.id);
    if (actual !== proof.expected) {
      throw new Error(
        `${label} proof ${proof.id} failed (expected ${proof.expected}, received ${actual}).`,
      );
    }
    results.push({ id: proof.id, expected: proof.expected, actual });
  }
  return results;
}

async function observeProofs(
  executor: DatabaseExecutor,
  proofs: ExpectedProof[],
): Promise<ProofObservation[]> {
  const observations: ProofObservation[] = [];
  for (const proof of proofs) {
    try {
      const actual = numericValue(await executor.execute(proof.sql), proof.id);
      observations.push({
        id: proof.id,
        expected: proof.expected,
        actual,
        passed: actual === proof.expected,
      });
    } catch {
      observations.push({
        id: proof.id,
        expected: proof.expected,
        actual: null,
        passed: false,
      });
    }
  }
  return observations;
}

function assertOnlyReconciliable0006Drift(
  observations: ProofObservation[],
): void {
  const blocking = observations.filter(
    (proof) => !proof.passed && !RECONCILIABLE_0006_PROOF_IDS.has(proof.id),
  );
  if (blocking.length > 0) {
    throw new Error(
      `Schema adoption has non-reconciliable drift: ${blocking.map((proof) => proof.id).join(", ")}.`,
    );
  }
}

function observedCount(
  observations: ProofObservation[],
  proofId: string,
): number {
  const value = observations.find((proof) => proof.id === proofId)?.actual;
  if (typeof value !== "number") {
    throw new Error(`Could not read adoption count for ${proofId}.`);
  }
  return value;
}

export async function verifyMigrations0003Through0007(
  executor: DatabaseExecutor,
): Promise<ProofResult[]> {
  return runProofs(executor, ADOPTION_PROOFS, "0003-0007 adoption");
}

export async function verifyMigrations0000Through0007(
  executor: DatabaseExecutor,
): Promise<ProofResult[]> {
  return [
    ...(await runProofs(
      executor,
      BASE_ADOPTION_PROOFS,
      "0000-0002 adoption",
    )),
    ...(await verifyMigrations0003Through0007(executor)),
  ];
}

function verifyReviewed0006Reconciliation(): string {
  const migration = readFileSync(MIGRATION_0006_PATH, "utf8");
  const executable = migration
    .replace(/^--.*$/gm, "")
    .split(";")
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const expected = [
    "UPDATE tasks SET status = 'waiting' WHERE status = 'blocked'",
    "UPDATE node_overlays SET manual_status = 'waiting' WHERE manual_status = 'blocked'",
  ];
  if (
    executable.length !== expected.length ||
    executable.some((statement, index) => statement !== expected[index])
  ) {
    throw new Error("Migration 0006 no longer matches the reviewed reconciliation.");
  }
  return rawFileSha256(MIGRATION_0006_PATH);
}

async function reconcileMigration0006(
  transaction: Transaction,
): Promise<StatusReconciliation> {
  verifyReviewed0006Reconciliation();
  const before = await observeProofs(
    transaction,
    ADOPTION_PROOFS.filter((proof) =>
      RECONCILIABLE_0006_PROOF_IDS.has(proof.id),
    ),
  );
  const expectedTasks = observedCount(before, "0006-no-blocked-task-status");
  const expectedNodeOverlays = observedCount(
    before,
    "0006-no-blocked-overlay-status",
  );
  const tasks = await transaction.execute(
    "UPDATE tasks SET status = 'waiting' WHERE status = 'blocked'",
  );
  const nodeOverlays = await transaction.execute(
    "UPDATE node_overlays SET manual_status = 'waiting' WHERE manual_status = 'blocked'",
  );
  if (
    tasks.rowsAffected !== expectedTasks ||
    nodeOverlays.rowsAffected !== expectedNodeOverlays
  ) {
    throw new Error("Migration 0006 reconciliation affected an unexpected row count.");
  }
  await runProofs(
    transaction,
    ADOPTION_PROOFS.filter((proof) =>
      RECONCILIABLE_0006_PROOF_IDS.has(proof.id),
    ),
    "0006 reconciliation",
  );
  return {
    tasksUpdated: tasks.rowsAffected,
    nodeOverlaysUpdated: nodeOverlays.rowsAffected,
  };
}

async function readLedgerPrefix(
  executor: DatabaseExecutor,
  expectedLedger: LedgerEntry[],
): Promise<number> {
  const exists = numericValue(
    await executor.execute(
      "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name = '__drizzle_migrations'",
    ),
    "drizzle-ledger-table-state",
  );
  if (exists === 0) return 0;
  const columns = numericValue(
    await executor.execute(
      "SELECT COUNT(*) AS value FROM pragma_table_info('__drizzle_migrations') WHERE name IN ('id','hash','created_at')",
    ),
    "drizzle-ledger-columns",
  );
  if (columns !== 3) {
    throw new Error("Existing Drizzle ledger does not have the expected schema.");
  }
  const rows = await executor.execute(
    "SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at ASC",
  );
  if (rows.rows.length > expectedLedger.length) {
    throw new Error("Drizzle ledger is ahead of the reviewed 0000-0008 chain.");
  }
  for (let index = 0; index < rows.rows.length; index += 1) {
    const row = rows.rows[index];
    const expected = expectedLedger[index];
    if (
      String(row.hash) !== expected.hash ||
      Number(row.created_at) !== expected.when
    ) {
      throw new Error(
        `Drizzle ledger row ${index} does not match the reviewed migration chain.`,
      );
    }
  }
  return rows.rows.length;
}

async function seedContiguousLedger(transaction: Transaction): Promise<number> {
  const expectedLedger = loadContiguousLedger();
  await verifyMigrations0000Through0007(transaction);
  if ((await readMigrationState(transaction)) !== "applied") {
    throw new Error("Drizzle ledger adoption requires migration 0008 to be applied.");
  }
  await transaction.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `);
  const prefixLength = await readLedgerPrefix(transaction, expectedLedger);
  for (const entry of expectedLedger.slice(prefixLength)) {
    await transaction.execute({
      sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
      args: [entry.hash, entry.when],
    });
  }
  const finalLength = await readLedgerPrefix(transaction, expectedLedger);
  if (finalLength !== expectedLedger.length) {
    throw new Error("Drizzle ledger adoption did not produce a contiguous chain.");
  }
  return finalLength;
}

async function readMigrationState(
  executor: DatabaseExecutor,
): Promise<MigrationState> {
  const columns = numericValue(
    await executor.execute(
      "SELECT COUNT(*) AS value FROM pragma_table_info('timeline_publications') WHERE name IN ('qualified_view_count','last_qualified_view_at')",
    ),
    "0008-publication-columns-state",
  );
  const receiptTable = numericValue(
    await executor.execute(
      "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name = 'audience_view_receipts'",
    ),
    "0008-receipt-table-state",
  );
  const receiptColumns = numericValue(
    await executor.execute(
      "SELECT COUNT(*) AS value FROM pragma_table_info('audience_view_receipts')",
    ),
    "0008-receipt-columns-state",
  );
  const expiryIndex = numericValue(
    await executor.execute(
      "SELECT COUNT(*) AS value FROM pragma_index_list('audience_view_receipts') WHERE name = 'idx_audience_view_receipts_expiry'",
    ),
    "0008-expiry-index-state",
  );

  if (
    columns === 0 &&
    receiptTable === 0 &&
    receiptColumns === 0 &&
    expiryIndex === 0
  ) {
    return "pending";
  }
  if (
    columns === 2 &&
    receiptTable === 1 &&
    receiptColumns === 4 &&
    expiryIndex === 1
  ) {
    return "applied";
  }
  return "partial";
}

function loadMigrationBundle(): {
  migrationSql: string;
  migrationSha256: string;
  receipt: MigrationReceipt;
  receiptMigration: MigrationReceipt["migrations"][number];
} {
  const migrationSql = readFileSync(MIGRATION_PATH, "utf8");
  const migrationSha256 = canonicalSha256(migrationSql);
  const receipt = JSON.parse(
    readFileSync(RECEIPT_PATH, "utf8"),
  ) as MigrationReceipt;
  const receiptMigration = receipt.migrations.find(
    (migration) => migration.id === "0008_qualified_audience_views",
  );
  if (!receiptMigration) {
    throw new Error("The reviewed receipt does not contain migration 0008.");
  }
  if (receiptMigration.sha256 !== migrationSha256) {
    throw new Error("Migration 0008 does not match its reviewed receipt hash.");
  }
  const executableSql = migrationSql.replace(/^--.*$/gm, "");
  if (/(?:^|;)\s*(?:DROP|DELETE|UPDATE|REPLACE|VACUUM)\b/i.test(executableSql)) {
    throw new Error("Migration 0008 is no longer additive-only.");
  }
  return { migrationSql, migrationSha256, receipt, receiptMigration };
}

async function verifyIntegrity(client: Client): Promise<void> {
  const integrity = await client.execute("PRAGMA integrity_check");
  if (
    integrity.rows.length !== 1 ||
    String(integrity.rows[0]?.integrity_check).toLowerCase() !== "ok"
  ) {
    throw new Error("SQLite integrity_check did not return ok.");
  }
  const foreignKeys = await client.execute("PRAGMA foreign_key_check");
  if (foreignKeys.rows.length !== 0) {
    throw new Error(
      `SQLite foreign_key_check found ${foreignKeys.rows.length} violation(s).`,
    );
  }
}

function assertPrivateAbsoluteBackupPath(path: string): string {
  if (!isAbsolute(path)) {
    throw new Error("--snapshot must be an absolute path.");
  }
  const target = resolve(path);
  const repoRelative = relative(REPO_ROOT, target);
  if (
    repoRelative === "" ||
    (!repoRelative.startsWith("..") && !isAbsolute(repoRelative))
  ) {
    throw new Error("Snapshots must be stored outside the repository.");
  }
  if (existsSync(target)) {
    throw new Error(`Snapshot target already exists: ${target}`);
  }
  return target;
}

function makePrivate(path: string): void {
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows ACLs remain authoritative when POSIX mode bits are unavailable.
  }
}

async function retryWindowsFileOperation(operation: () => void): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      operation();
      return;
    } catch (error) {
      lastError = error;
      const code =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "";
      if (code !== "EBUSY" && code !== "EPERM") throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
    }
  }
  throw lastError;
}

async function copySqliteSequence(
  remote: Transaction,
  local: Client,
): Promise<void> {
  const remoteSequenceExists = numericValue(
    await remote.execute(
      "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name = 'sqlite_sequence'",
    ),
    "remote-sqlite-sequence-state",
  );
  if (remoteSequenceExists === 0) return;
  const localSequenceExists = numericValue(
    await local.execute(
      "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name = 'sqlite_sequence'",
    ),
    "local-sqlite-sequence-state",
  );
  if (localSequenceExists !== 1) {
    throw new Error("Snapshot cannot restore sqlite_sequence safely.");
  }
  const rows = await remote.execute("SELECT name, seq FROM sqlite_sequence");
  await local.execute("DELETE FROM sqlite_sequence");
  if (rows.rows.length > 0) {
    await local.batch(
      rows.rows.map((row) => ({
        sql: "INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)",
        args: [row[0] as InValue, row[1] as InValue],
      })),
      "write",
    );
  }
}

export async function createLogicalSnapshot(
  remoteClient: Client,
  requestedPath: string,
): Promise<{ path: string; manifestPath: string; manifest: SnapshotManifest }> {
  const targetPath = assertPrivateAbsoluteBackupPath(requestedPath);
  mkdirSync(dirname(targetPath), { recursive: true });
  const manifestPath = `${targetPath}.manifest.json`;
  if (existsSync(manifestPath)) {
    throw new Error(`Snapshot manifest target already exists: ${manifestPath}`);
  }

  let targetReserved = false;
  let local: Client | undefined;
  let remote: Transaction | undefined;
  const tableCounts: TableCount[] = [];
  let completed = false;

  try {
    const reservation = openSync(targetPath, "wx", 0o600);
    closeSync(reservation);
    targetReserved = true;
    makePrivate(targetPath);
    local = createClient({
      url: pathToFileURL(targetPath).href,
      intMode: "bigint",
    });
    remote = await remoteClient.transaction("read");

    const adoptionProofs = await observeProofs(remote, ALL_ADOPTION_PROOFS);
    assertOnlyReconciliable0006Drift(adoptionProofs);
    const state = await readMigrationState(remote);
    if (state !== "pending") {
      throw new Error(
        `Snapshot requires migration 0008 to be pending; database state is ${state}.`,
      );
    }

    const schema = await remote.execute(`
      SELECT type, name, tbl_name, sql
      FROM sqlite_schema
      WHERE sql IS NOT NULL
        AND name NOT LIKE 'sqlite_%'
        AND type IN ('table', 'index', 'view', 'trigger')
      ORDER BY
        CASE type
          WHEN 'table' THEN 0
          WHEN 'index' THEN 1
          WHEN 'view' THEN 2
          WHEN 'trigger' THEN 3
          ELSE 4
        END,
        name
    `);
    const entities = schema.rows.map((row) => ({
      type: String(row.type),
      name: String(row.name),
      tableName: String(row.tbl_name),
      sql: String(row.sql),
    }));
    const virtual = entities.find(
      (entity) =>
        entity.type === "table" && /^\s*CREATE\s+VIRTUAL\s+TABLE\b/i.test(entity.sql),
    );
    if (virtual) {
      throw new Error(
        `Logical snapshot safety gate: virtual table ${virtual.name} requires the native database backup path.`,
      );
    }

    await local.execute("PRAGMA foreign_keys = OFF");
    for (const entity of entities.filter((item) => item.type === "table")) {
      await local.execute(entity.sql);
    }

    for (const entity of entities.filter((item) => item.type === "table")) {
      const table = entity.name;
      const columnResult = await remote.execute(
        `SELECT name, hidden FROM pragma_table_xinfo(${quoteLiteral(table)}) ORDER BY cid`,
      );
      const columns = columnResult.rows
        .filter((row) => Number(row.hidden) === 0)
        .map((row) => String(row.name));
      const remoteCount = numericValue(
        await remote.execute(
          `SELECT COUNT(*) AS value FROM ${quoteIdentifier(table)}`,
        ),
        `remote-row-count-${table}`,
      );
      if (remoteCount > 0 && columns.length === 0) {
        throw new Error(`Table ${table} has rows but no restorable columns.`);
      }

      const columnSql = columns.map(quoteIdentifier).join(", ");
      const placeholders = columns.map(() => "?").join(", ");
      for (let offset = 0; offset < remoteCount; offset += PAGE_SIZE) {
        const page = await remote.execute({
          sql: `SELECT ${columnSql} FROM ${quoteIdentifier(table)} LIMIT ? OFFSET ?`,
          args: [PAGE_SIZE, offset],
        });
        if (page.rows.length === 0) {
          throw new Error(`Snapshot read ended early for table ${table}.`);
        }
        await local.batch(
          page.rows.map((row) => ({
            sql: `INSERT INTO ${quoteIdentifier(table)} (${columnSql}) VALUES (${placeholders})`,
            args: columns.map((_, index) => row[index] as InValue),
          })),
          "write",
        );
      }

      const localCount = numericValue(
        await local.execute(
          `SELECT COUNT(*) AS value FROM ${quoteIdentifier(table)}`,
        ),
        `local-row-count-${table}`,
      );
      if (localCount !== remoteCount) {
        throw new Error(
          `Snapshot row-count mismatch for ${table} (remote ${remoteCount}, local ${localCount}).`,
        );
      }
      tableCounts.push({ table, rows: remoteCount });
    }

    await copySqliteSequence(remote, local);
    for (const type of ["index", "view", "trigger"] as const) {
      for (const entity of entities.filter((item) => item.type === type)) {
        await local.execute(entity.sql);
      }
    }

    await local.execute("PRAGMA foreign_keys = ON");
    await verifyIntegrity(local);
    local.close();
    remote.close();
    makePrivate(targetPath);

    const manifest: SnapshotManifest = {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      sha256: fileSha256(targetPath),
      bytes: statSync(targetPath).size,
      migration0008State: "pending",
      adoptionProofs,
      pendingStatusReconciliation: {
        tasks: observedCount(
          adoptionProofs,
          "0006-no-blocked-task-status",
        ),
        nodeOverlays: observedCount(
          adoptionProofs,
          "0006-no-blocked-overlay-status",
        ),
      },
      tableCounts,
      integrityCheck: "ok",
      foreignKeyViolations: 0,
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    makePrivate(manifestPath);
    completed = true;
    return { path: targetPath, manifestPath, manifest };
  } finally {
    if (local && !local.closed) local.close();
    if (remote && !remote.closed) remote.close();
    if (!completed && existsSync(manifestPath)) {
      try {
        await retryWindowsFileOperation(() => unlinkSync(manifestPath));
      } catch {
        // The manifest must remain absent for an incomplete snapshot. A
        // cleanup failure is deliberately not allowed to mask the root error.
      }
    }
    if (!completed && targetReserved && existsSync(targetPath)) {
      try {
        await retryWindowsFileOperation(() => unlinkSync(targetPath));
      } catch {
        // A manifest-less target is an explicit incomplete marker if the
        // Windows libSQL binding retains the exact file handle until exit.
      }
    }
  }
}

function loadAndVerifySnapshotManifest(snapshotPath: string): SnapshotManifest {
  const manifestPath = `${snapshotPath}.manifest.json`;
  if (!existsSync(snapshotPath) || !existsSync(manifestPath)) {
    throw new Error("Snapshot database and manifest are both required.");
  }
  const manifest = JSON.parse(
    readFileSync(manifestPath, "utf8"),
  ) as SnapshotManifest;
  if (manifest.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error("Snapshot manifest schema is not supported.");
  }
  if (manifest.migration0008State !== "pending") {
    throw new Error("Snapshot manifest is not a pre-0008 backup.");
  }
  if (fileSha256(snapshotPath) !== manifest.sha256) {
    throw new Error("Snapshot file no longer matches its manifest hash.");
  }
  return manifest;
}

async function verifyTableCounts(
  client: Client,
  expected: TableCount[],
): Promise<TableCount[]> {
  const actual: TableCount[] = [];
  for (const table of expected) {
    const rows = numericValue(
      await client.execute(
        `SELECT COUNT(*) AS value FROM ${quoteIdentifier(table.table)}`,
      ),
      `verified-row-count-${table.table}`,
    );
    if (rows !== table.rows) {
      throw new Error(
        `Row-count proof failed for ${table.table} (expected ${table.rows}, received ${rows}).`,
      );
    }
    actual.push({ table: table.table, rows });
  }
  return actual;
}

export async function dryRunQualifiedViewMigration(
  snapshotPath: string,
): Promise<{ path: string; reportPath: string; report: DryRunReport }> {
  const manifest = loadAndVerifySnapshotManifest(snapshotPath);
  const dryRunPath = `${snapshotPath}.0008-dry-run.sqlite`;
  const reportPath = `${dryRunPath}.report.json`;
  if (existsSync(dryRunPath) || existsSync(reportPath)) {
    throw new Error(
      `Dry-run target already exists; preserve it or choose a new snapshot path: ${dryRunPath}`,
    );
  }
  copyFileSync(snapshotPath, dryRunPath, 0);
  makePrivate(dryRunPath);

  const client = createClient({
    url: pathToFileURL(dryRunPath).href,
    intMode: "bigint",
  });
  const { migrationSql, migrationSha256, receipt, receiptMigration } =
    loadMigrationBundle();
  try {
    const adoptionBefore = await observeProofs(client, ALL_ADOPTION_PROOFS);
    assertOnlyReconciliable0006Drift(adoptionBefore);
    if (
      observedCount(adoptionBefore, "0006-no-blocked-task-status") !==
        manifest.pendingStatusReconciliation.tasks ||
      observedCount(adoptionBefore, "0006-no-blocked-overlay-status") !==
        manifest.pendingStatusReconciliation.nodeOverlays
    ) {
      throw new Error("Snapshot 0006 reconciliation counts do not match its manifest.");
    }
    if ((await readMigrationState(client)) !== "pending") {
      throw new Error("Dry-run copy is not in the expected pre-0008 state.");
    }
    await verifyTableCounts(client, manifest.tableCounts);

    const transaction = await client.transaction("write");
    let proofResults: ProofResult[];
    let ledgerEntries: number;
    let statusReconciliation: StatusReconciliation;
    try {
      statusReconciliation = await reconcileMigration0006(transaction);
      await verifyMigrations0000Through0007(transaction);
      await transaction.executeMultiple(migrationSql);
      if ((await readMigrationState(transaction)) !== "applied") {
        throw new Error("Migration 0008 left the dry-run copy in a partial state.");
      }
      proofResults = await runProofs(
        transaction,
        receiptMigration.proofs,
        "0008 receipt",
      );
      ledgerEntries = await seedContiguousLedger(transaction);
      await transaction.commit();
    } finally {
      if (!transaction.closed) transaction.close();
    }

    const tableCounts = await verifyTableCounts(
      client,
      manifest.tableCounts.filter(
        (table) => table.table !== "__drizzle_migrations",
      ),
    );
    if (
      (await readLedgerPrefix(client, loadContiguousLedger())) !== ledgerEntries
    ) {
      throw new Error("Dry-run Drizzle ledger verification failed after commit.");
    }
    await verifyIntegrity(client);
    client.close();
    makePrivate(dryRunPath);
    const report: DryRunReport = {
      schemaVersion: DRY_RUN_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      sha256: fileSha256(dryRunPath),
      migrationSha256,
      snapshotSha256: manifest.sha256,
      receiptId: receipt.id,
      ledgerEntries,
      statusReconciliation,
      proofResults,
      tableCounts,
      integrityCheck: "ok",
      foreignKeyViolations: 0,
    };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    makePrivate(reportPath);
    return { path: dryRunPath, reportPath, report };
  } catch (error) {
    if (!client.closed) client.close();
    throw error;
  }
}

export async function applyQualifiedViewMigration(
  remoteClient: Client,
): Promise<{
  migrationProofs: ProofResult[];
  adoptionProofs: ProofResult[];
  statusReconciliation: StatusReconciliation;
  ledgerEntries: number;
}> {
  const { migrationSql, receiptMigration } = loadMigrationBundle();
  const transaction = await remoteClient.transaction("write");
  let migrationProofs: ProofResult[];
  let adoptionProofs: ProofResult[];
  let statusReconciliation: StatusReconciliation;
  let ledgerEntries: number;
  try {
    const adoptionBefore = await observeProofs(transaction, ALL_ADOPTION_PROOFS);
    assertOnlyReconciliable0006Drift(adoptionBefore);
    const state = await readMigrationState(transaction);
    if (state !== "pending") {
      throw new Error(
        `Remote apply requires migration 0008 to be pending; database state is ${state}.`,
      );
    }
    statusReconciliation = await reconcileMigration0006(transaction);
    adoptionProofs = await verifyMigrations0000Through0007(transaction);
    await transaction.executeMultiple(migrationSql);
    if ((await readMigrationState(transaction)) !== "applied") {
      throw new Error("Migration 0008 left the remote database in a partial state.");
    }
    migrationProofs = await runProofs(
      transaction,
      receiptMigration.proofs,
      "0008 receipt",
    );
    ledgerEntries = await seedContiguousLedger(transaction);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  } finally {
    if (!transaction.closed) transaction.close();
  }

  if ((await readMigrationState(remoteClient)) !== "applied") {
    throw new Error("Post-commit verification could not confirm migration 0008.");
  }
  await runProofs(remoteClient, receiptMigration.proofs, "0008 post-commit receipt");
  const expectedLedger = loadContiguousLedger();
  if ((await readLedgerPrefix(remoteClient, expectedLedger)) !== expectedLedger.length) {
    throw new Error("Post-commit verification could not confirm the Drizzle ledger.");
  }
  await verifyIntegrity(remoteClient);
  return {
    migrationProofs,
    adoptionProofs,
    statusReconciliation,
    ledgerEntries,
  };
}

function prepareAppliedReceiptPath(requestedPath: string): string {
  if (!isAbsolute(requestedPath)) {
    throw new Error("--receipt must be an absolute path.");
  }
  const target = resolve(requestedPath);
  if (existsSync(target)) {
    throw new Error(`Applied receipt target already exists: ${target}`);
  }
  mkdirSync(dirname(target), { recursive: true });
  return target;
}

function writeAppliedReceipt(
  targetPath: string,
  receipt: AppliedReceipt,
): void {
  const temporaryPath = `${targetPath}.partial-${randomUUID()}`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    makePrivate(temporaryPath);
    renameSync(temporaryPath, targetPath);
    makePrivate(targetPath);
  } finally {
    if (existsSync(temporaryPath)) {
      try {
        unlinkSync(temporaryPath);
      } catch {
        // A locked partial receipt contains no credentials or database rows.
      }
    }
  }
}

function parseCli(argv: string[]): CliOptions {
  const options: CliOptions = {
    inspect: false,
    dryRun: false,
    apply: false,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (
      argument === "--env" ||
      argument === "--snapshot" ||
      argument === "--receipt"
    ) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a path.`);
      }
      if (argument === "--env") options.envPath = resolve(value);
      else if (argument === "--snapshot") options.snapshotPath = resolve(value);
      else options.receiptPath = resolve(value);
      index += 1;
    } else if (argument === "--inspect") {
      options.inspect = true;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function printHelp(): void {
  console.log(`Signal Timeline qualified-view migration operator

Read-only adoption inspection:
  pnpm db:qualified-views -- --env C:\\secure\\production.env --inspect

Fresh logical snapshot plus dry-run (no remote writes):
  pnpm db:qualified-views -- --env C:\\secure\\production.env --snapshot C:\\secure\\backups\\timeline-pre-0008.sqlite --dry-run

Apply only after a fresh snapshot and successful dry-run in the same command:
  pnpm db:qualified-views -- --env C:\\secure\\production.env --snapshot C:\\secure\\backups\\timeline-pre-0008.sqlite --dry-run --apply --receipt C:\\secure\\backups\\timeline-0008-applied.json

The env file must contain TIMELINE_DATABASE_URL and TIMELINE_AUTH_TOKEN.
Credential values and database row values are never printed.`);
}

function loadCredentials(path: string): { url: string; authToken: string } {
  if (!existsSync(path)) throw new Error(`Env file does not exist: ${path}`);
  const parsed = parseDotenv(readFileSync(path, "utf8"));
  const url = parsed.TIMELINE_DATABASE_URL?.trim();
  const authToken = parsed.TIMELINE_AUTH_TOKEN?.trim();
  if (!url || !authToken) {
    throw new Error(
      "Env file must define TIMELINE_DATABASE_URL and TIMELINE_AUTH_TOKEN.",
    );
  }
  let protocol: string;
  try {
    protocol = new URL(url).protocol;
  } catch {
    throw new Error("TIMELINE_DATABASE_URL is not a valid URL.");
  }
  if (!new Set(["libsql:", "https:", "wss:"]).has(protocol)) {
    throw new Error(
      "TIMELINE_DATABASE_URL must use a remote TLS-capable protocol (libsql, https, or wss).",
    );
  }
  return { url, authToken };
}

function redactError(error: unknown, secrets: string[]): string {
  let message = error instanceof Error ? error.message : "Unknown failure.";
  for (const secret of secrets) {
    if (secret) message = message.replaceAll(secret, "[withheld]");
  }
  return message
    .replace(/(?:libsql|https|wss):\/\/[^\s]+/gi, "[database URL withheld]")
    .replace(/(?:token|authorization)=?[^\s]+/gi, "$1=[withheld]");
}

async function runCli(argv: string[]): Promise<void> {
  const options = parseCli(argv);
  if (options.help) {
    printHelp();
    return;
  }
  if (!options.envPath) throw new Error("--env is required.");
  if (!options.inspect && !options.snapshotPath) {
    throw new Error("Choose --inspect or provide --snapshot.");
  }
  if (options.dryRun && !options.snapshotPath) {
    throw new Error("--dry-run requires --snapshot.");
  }
  if (options.apply && (!options.snapshotPath || !options.dryRun)) {
    throw new Error("--apply requires --snapshot and --dry-run in the same command.");
  }
  if (options.apply && !options.receiptPath) {
    throw new Error("--apply requires an explicit --receipt path.");
  }
  if (options.receiptPath && !options.apply) {
    throw new Error("--receipt is only valid with --apply.");
  }

  const credentials = loadCredentials(options.envPath);
  const secrets = [credentials.url, credentials.authToken];
  const appliedReceiptPath = options.receiptPath
    ? prepareAppliedReceiptPath(options.receiptPath)
    : undefined;
  let remote: Client;
  try {
    remote = createClient({ ...credentials, intMode: "bigint" });
  } catch (error) {
    throw new Error(redactError(error, secrets));
  }
  try {
    console.log("qualified-view-release: credentials loaded (values withheld)");
    const adoption = await observeProofs(remote, ALL_ADOPTION_PROOFS);
    const state = await readMigrationState(remote);
    const ledger = loadContiguousLedger();
    const ledgerPrefix = await readLedgerPrefix(remote, ledger);
    const adoptionPasses = adoption.filter((proof) => proof.passed).length;
    console.log(
      `qualified-view-release: 0000-0007 adoption observed (${adoptionPasses}/${ALL_ADOPTION_PROOFS.length} proofs pass)`,
    );
    for (const proof of adoption.filter((item) => !item.passed)) {
      console.log(
        `qualified-view-release: adoption drift ${proof.id} (expected ${proof.expected}, received ${proof.actual ?? "unreadable"})`,
      );
    }
    console.log(`qualified-view-release: migration 0008 state is ${state}`);
    console.log(
      `qualified-view-release: Drizzle ledger prefix is ${ledgerPrefix}/${ledger.length}`,
    );
    assertOnlyReconciliable0006Drift(adoption);
    if (state === "partial") {
      throw new Error("Migration 0008 is partially present; operator review is required.");
    }
    if (state === "applied") {
      const { receiptMigration } = loadMigrationBundle();
      const proofs = await runProofs(
        remote,
        receiptMigration.proofs,
        "0008 receipt",
      );
      console.log(
        `qualified-view-release: existing 0008 receipt verified (${proofs.length} proofs)`,
      );
      if (options.snapshotPath || options.apply) {
        throw new Error(
          "Migration 0008 is already applied; no pre-migration snapshot or write was attempted.",
        );
      }
      return;
    }

    if (options.snapshotPath) {
      const snapshot = await createLogicalSnapshot(remote, options.snapshotPath);
      const totalRows = snapshot.manifest.tableCounts.reduce(
        (sum, table) => sum + table.rows,
        0,
      );
      console.log(
        `qualified-view-release: snapshot verified (${snapshot.manifest.tableCounts.length} tables, ${totalRows} rows)`,
      );
      console.log(`qualified-view-release: snapshot ${snapshot.path}`);
      console.log(`qualified-view-release: manifest ${snapshot.manifestPath}`);

      let dryRun:
        | Awaited<ReturnType<typeof dryRunQualifiedViewMigration>>
        | undefined;
      if (options.dryRun) {
        dryRun = await dryRunQualifiedViewMigration(snapshot.path);
        console.log(
          `qualified-view-release: dry-run passed (${dryRun.report.proofResults.length} receipt proofs, ${dryRun.report.ledgerEntries} ledger entries)`,
        );
        console.log(`qualified-view-release: dry-run copy ${dryRun.path}`);
        console.log(`qualified-view-release: dry-run report ${dryRun.reportPath}`);
      }
      if (options.apply) {
        if (!dryRun || !appliedReceiptPath) {
          throw new Error("Apply safety gate did not produce its dry-run or receipt path.");
        }
        const applied = await applyQualifiedViewMigration(remote);
        const { migrationSha256, receipt } = loadMigrationBundle();
        const appliedReceipt: AppliedReceipt = {
          schemaVersion: APPLIED_RECEIPT_SCHEMA_VERSION,
          receiptId: receipt.id,
          appliedAt: new Date().toISOString(),
          migrationSha256,
          migration0006Sha256: verifyReviewed0006Reconciliation(),
          snapshot: {
            path: snapshot.path,
            manifestPath: snapshot.manifestPath,
            databaseSha256: snapshot.manifest.sha256,
            manifestSha256: rawFileSha256(snapshot.manifestPath),
          },
          dryRun: {
            path: dryRun.path,
            reportPath: dryRun.reportPath,
            databaseSha256: dryRun.report.sha256,
            reportSha256: rawFileSha256(dryRun.reportPath),
          },
          statusReconciliation: applied.statusReconciliation,
          finalLedgerLength: applied.ledgerEntries,
          adoptionPostconditions: applied.adoptionProofs,
          migrationPostconditions: applied.migrationProofs,
          integrityCheck: "ok",
          foreignKeyViolations: 0,
        };
        writeAppliedReceipt(appliedReceiptPath, appliedReceipt);
        console.log(
          `qualified-view-release: remote 0008 apply committed and verified (${applied.migrationProofs.length} receipt proofs, ${applied.ledgerEntries} ledger entries)`,
        );
        console.log(
          `qualified-view-release: 0006 reconciled (${applied.statusReconciliation.tasksUpdated} task rows, ${applied.statusReconciliation.nodeOverlaysUpdated} overlay rows)`,
        );
        console.log(`qualified-view-release: applied receipt ${appliedReceiptPath}`);
      } else {
        console.log("qualified-view-release: remote database remained read-only");
      }
    } else {
      console.log("qualified-view-release: remote database remained read-only");
    }
  } catch (error) {
    throw new Error(redactError(error, secrets));
  } finally {
    remote.close();
  }
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    console.error(`qualified-view-release: ${redactError(error, [])}`);
    process.exitCode = 1;
  });
}

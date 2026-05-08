/**
 * parse-markdown.ts — general-purpose markdown → roadmap items.
 *
 * Pure function: no DB access, no filesystem, no imports beyond types.
 * Takes raw markdown + workspace/project slugs, returns flat item list.
 *
 * Heading hierarchy:
 *   # Title  → ignored (potential workspace name fallback in future)
 *   ## Group → weekHeading for items below
 *   ### Sub  → category for items below
 *
 * Status from bullet prefix:
 *   - [ ] or bare -  → next
 *   - [x] / [X]      → shipped
 *   - [/] / [~]      → in-flight
 *   - [-]            → refused
 *   - [!]            → blocked
 *
 * Deterministic IDs: `${workspaceSlug}-${projectSlug}-${ord}` (zero-padded to 4 digits).
 * Re-pasting the same markdown produces the same IDs; reordering shifts IDs — v1 known limitation.
 *
 * Parser never throws. Malformed lines are silently skipped.
 */

export type ParsedStatus = "next" | "in-flight" | "shipped" | "refused" | "blocked";
export type ParsedKind = "cycle" | "action" | "refusal" | "blocker";

export type ParsedItem = {
  id: string;
  workspaceSlug: string;
  projectSlug: string;
  title: string;
  description: string;
  status: ParsedStatus;
  kind: ParsedKind;
  targetDate: string | null; // ISO YYYY-MM-DD or null
  weekHeading: string | null;
  category: string | null;
  sortOrder: number;
  isLaunch: boolean; // always false in v1
};

export type ParseResult = {
  items: ParsedItem[];
  parseError?: string;
};

// Matches YYYY-MM-DD anywhere in a string. Captures the date.
const ISO_DATE_RE = /(\d{4}-\d{2}-\d{2})/;

// Bullet: optional indentation, then "- " optionally followed by "[x]"-style bracket
// Group 1: bracket content (x, X, /, ~, -, !, space, or empty)
// Group 2: everything after the bracket
const BULLET_RE = /^[ \t]*-\s+(?:\[([xX/~\-! ]?)\]\s*)?(.+)$/;

// Level 1 heading
const H1_RE = /^#\s+(.+)/;
// Level 2 heading
const H2_RE = /^##\s+(.+)/;
// Level 3 heading
const H3_RE = /^###\s+(.+)/;

function extractDate(line: string): string | null {
  const m = line.match(ISO_DATE_RE);
  return m ? m[1] : null;
}

function stripDate(text: string): string {
  // Remove the date and surrounding punctuation/parens
  return text
    .replace(/\s*[·—(]\s*\d{4}-\d{2}-\d{2}\s*\)?\s*/g, " ")
    .replace(/\s*\d{4}-\d{2}-\d{2}\s*/g, " ")
    .trim();
}

function parseTitleDescription(raw: string): { title: string; description: string } {
  // Split on first " — " or " - " (em-dash or bare " - " used as separator) or ": "
  // We want to avoid splitting on the bullet hyphen itself, so we only split on
  // " — " or ": " (with surrounding spaces) to be safe.
  const sepMatch = raw.match(/^([^—:]+?)\s*(?:—|:)\s*(.+)$/);
  if (sepMatch) {
    return {
      title: sepMatch[1].trim(),
      description: sepMatch[2].trim(),
    };
  }
  return { title: raw.trim(), description: "" };
}

function statusFromBracket(bracket: string | undefined): ParsedStatus {
  if (!bracket) return "next"; // bare "- text" with no bracket → next
  switch (bracket) {
    case "x":
    case "X":
      return "shipped";
    case "/":
    case "~":
      return "in-flight";
    case "-":
      return "refused";
    case "!":
      return "blocked";
    default:
      // " " (space) or anything else → next
      return "next";
  }
}

function kindFromStatus(status: ParsedStatus): ParsedKind {
  switch (status) {
    case "shipped":
      return "cycle";
    case "refused":
      return "refusal";
    case "blocked":
      return "blocker";
    default:
      return "action";
  }
}

function padOrd(n: number): string {
  return String(n).padStart(4, "0");
}

export function parseMarkdown({
  rawMarkdown,
  workspaceSlug,
  projectSlug,
}: {
  rawMarkdown: string;
  workspaceSlug: string;
  projectSlug: string;
}): ParseResult {
  if (!rawMarkdown?.trim()) {
    return { items: [] };
  }

  const items: ParsedItem[] = [];
  const lines = rawMarkdown.split("\n");

  let weekHeading: string | null = null;
  let category: string | null = null;
  let ord = 0;

  for (const line of lines) {
    // Skip blank lines
    if (!line.trim()) continue;

    // H3 check first (before H2, since ## would match ### if not careful)
    const h3 = line.match(H3_RE);
    if (h3) {
      category = h3[1].trim();
      continue;
    }

    const h2 = line.match(H2_RE);
    if (h2) {
      weekHeading = h2[1].trim();
      // H2 resets category
      category = null;
      continue;
    }

    // H1 — ignored
    if (H1_RE.test(line)) continue;

    // Bullet
    const bulletMatch = line.match(BULLET_RE);
    if (!bulletMatch) continue;

    // Skip indented bullets (child items) — Deliverable 6 territory
    if (/^[ \t]{2,}/.test(line)) continue;

    const bracketContent = bulletMatch[1];
    const rawText = bulletMatch[2].trim();

    if (!rawText) continue;

    const status = statusFromBracket(bracketContent);
    const kind = kindFromStatus(status);

    // Extract date before stripping it from text
    const targetDate = extractDate(rawText);

    // Strip date from text before parsing title/description
    const textWithoutDate = stripDate(rawText);
    const { title, description } = parseTitleDescription(textWithoutDate);

    if (!title) continue;

    const id = `${workspaceSlug}-${projectSlug}-${padOrd(ord)}`;

    items.push({
      id,
      workspaceSlug,
      projectSlug,
      title,
      description,
      status,
      kind,
      targetDate,
      weekHeading,
      category,
      sortOrder: ord,
      isLaunch: false,
    });

    ord++;
  }

  return { items };
}

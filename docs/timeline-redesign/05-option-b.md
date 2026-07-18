# Option B: Editorial Plan Room

Phase: coded design-lab direction only
Production status: not selected and not shipped
Implementation evidence: `src/components/design-lab/timeline/options/option-b.tsx` and `option-b.module.css`

## Intent

Editorial Plan Room optimises for human understanding. Purpose, current direction, movement, and decision reasons receive more space than administration. The public plan reads like an edited briefing without becoming a marketing page or a long report.

Its central proposition is that people trust a plan when they can see both the direction and the editorial judgement behind it.

## Structural signature

- The owner view is an asymmetric working document with a change and decision margin.
- The public view gives one Now item lead treatment, followed by a restrained Soon and Later index and closing Done and Refused records.
- The shared update is a forwardable article, led by current direction and `What changed, and why`.
- Item detail separates narrative meaning from a compact facts column and retains plan context below.
- Section numbering, datelines, and measured line lengths create editorial rhythm without oversized display type or decorative magazine devices.

This option remains distinct in grayscale because hierarchy comes from composition, not status colour.

## Four-surface composition

| Surface | Composition | Primary question answered |
| --- | --- | --- |
| Owner plan | Plan chapters, selected-row controls, owner-only note, and a change or decision margin. | What judgement supports this item, and what should be edited? |
| Public timeline | One lead Now story, a Soon and Later index, then settled records. | What matters most, and what follows it? |
| Shared update | Standfirst, current direction, paired change and reason records, attention summary, and full ladder receipt. | What should I understand and forward? |
| Item detail | Narrative meaning and next step beside a public-facts column, with history and surrounding plan context. | Why is this here, and what happens next? |

Owner-only notes appear only in the owner composition. Public, update, and detail surfaces consume the same whitelisted projection as the other options.

## Interaction position

The editorial margin is contextual, not a second data model. Selection reveals the common owner tools beside the public wording and its latest change. Publication controls keep working preview, published view, last publication, and unpublished count explicit.

The lab demonstrates the proposed editorial relationship around owner operations. It does not prove a production editor, collaboration workflow, comment system, or automatic narrative generation.

## Strengths to test

- Strongest ten-second articulation of purpose and current direction.
- Strongest candidate for a shared update that survives forwarding without product context.
- Gives movement reasons and refusal decisions appropriate dignity.
- Makes optional confidence and timing language understandable as prose rather than scores.
- Creates a clear separation between current direction and the full-plan receipt.

## Tradeoffs and red-team risks

- More vertical space can slow owners who mainly need rapid repeated curation.
- A lead item can imply false priority if item order is not deliberately maintained.
- Dense data requires careful truncation policy and line-length control without suppressing facts.
- Editorial labels and datelines must not drift into marketing theatre.
- Repeating a narrative summary, attention summary, and full ladder can become redundant if each section does not answer a different question.

## Phase 2 boundary

Selection of this option would approve its editorial hierarchy, not an invented publishing or authoring system. Production work would still need canonical ladder mapping, server-side public projection, real snapshot semantics, anonymous share verification, source-parameter preservation, metadata and print proof, and migration of existing item histories into decision-complete public records.

No production route, database record, publish action, or public URL is changed by this option.

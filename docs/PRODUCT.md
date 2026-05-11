# Signal Roadmap · Product

Signal Roadmap delivers **direction clarity**.

It gives a person one public place to explain what is happening, what changed,
what is waiting, and what will not be picked up. It is for people who need the
plan without being made to learn project-management vocabulary.

## Promise

Publish a readable plan in minutes. Share one link. Let customers, clients, and
collaborators see the direction without an account.

## Current State

Status: **private preview**.

The repo contains the core Roadmap product surface:

- Public workspace and project pages.
- Shared update page at `/[workspace]/update`.
- Item detail pages.
- Refusals page.
- Auth-backed app shell.
- Workspace and project creation forms.
- Plain-text source editor.
- Public demo route.

Claims about billing, digest emails, calendar subscriptions, custom share
images, or other paid-plan automation must stay marked planned unless the repo
contains the route, dependency, and preview proof.

## Audience

Signal Roadmap is for the person who has to explain direction to people outside
the work:

- Service operators sharing a plan with clients.
- Solo professionals keeping commitments visible.
- Small teams that need a public plan without a status meeting.
- Students and public-facing coordinators who need one readable source of
  truth.

## Surface

The default surface is public. A roadmap that cannot be shared without a login
has missed the point.

Core vocabulary:

- `Shipped` for work that is done.
- `Doing` for work in motion.
- `Next` for work that is queued.
- `Held up` or `Blocked` only when the public-roadmap meaning is useful.
- `Refused` for work that will not happen.

## Locked Refusals

- No private workspaces in v1.
- No team tier in v1.
- No comment threading.
- No public directory of Roadmap workspaces.
- No "all-in-one" framing.
- No engineering-team framing.
- No demo-vs-reality gap.
- No user-facing Vercel fallback URLs.

## Copy Rules

Use full product names in marketing and suite surfaces: Signal Roadmap, Signal
Tasks, Signal Analytics, Signal Notes.

Do not use "stakeholder", "sprint", "velocity", "backlog export", "project
management tool", or "engineering team" as positive product language. If a
forbidden word appears, it should be clearly framed as something Signal Roadmap
refuses.

Use `hello@signalstudio.ie` for contact. Never use a personal email address in
public product copy.

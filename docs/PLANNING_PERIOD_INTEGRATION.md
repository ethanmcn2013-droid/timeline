# Planning Period integration

Timeline is the frozen-publication authority. Tasks remains the authority for
current Workspace membership and canonical Workspace identity.

## Notes promotion receiver

`POST /api/internal/notes-timeline` accepts only a short-lived HMAC assertion
with audience `signal-timeline.note-projection` and the exact v1 command shape:

```json
{
  "version": 1,
  "source": { "product": "notes", "noteId": "..." },
  "workspaceId": "...",
  "projection": { "title": "...", "date": "YYYY-MM-DD", "completion": 0 },
  "audience": { "kind": "named", "label": "..." }
}
```

The receiver verifies the assertion, rejects replayed JTIs, checks current Tasks
membership through the configured Tasks database contract, resolves the local
Timeline owner mapping, and then writes a frozen published projection with a
hash-only 256-bit share token. It never accepts Note body text, descriptions,
attachments, comments, or arbitrary metadata. The raw URL is returned once.

`NOTES_TO_TIMELINE_SECRET` must be shared by Notes and Timeline. Preview/staging
can set `TIMELINE_PROMOTION_API_URL`; production defaults to
`https://timeline.signalstudio.ie/api/internal/notes-timeline`.

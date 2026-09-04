@AGENTS.md

# Working conventions for Becca's Knotique

Standing instructions from the owner. Follow these on every task unless the
owner says otherwise in the moment.

## Release log — always update it
Whenever work ships, add a release-log entry as part of the push.
- The log is **database-backed**: model `src/lib/models/Release.ts`, data layer
  `src/lib/releases.ts`, admin editor `src/components/admin/ReleaseManager.tsx`,
  shown on the admin-only `/admin/releases` page.
- `src/data/releases.ts` is **only a one-time seed** (used when the `releases`
  collection is empty). Editing that file does NOT change what's displayed once
  the DB has entries. Add new entries to the **database** — via the admin UI, or
  by inserting into the `releases` collection: `{ date: "YYYY-MM-DD", title,
  tag, items: [] }`.
- Group same-day work into one dated entry. Use the real current date. Pick a
  tag: `launch | feature | improvement | fix`. Write plain-English bullets.

## Dialogs — never use the native browser ones
Do not use `window.confirm()`, `window.alert()`, or `window.prompt()`.
- For confirmations use the app's promise-based dialog: `useConfirm()` from
  `src/components/ui/confirm.tsx` — `const confirm = useConfirm();
  if (!(await confirm({ title, description, confirmText, destructive }))) return;`
  (`ConfirmProvider` is already mounted in the app).
- For messages/feedback use inline UI or the existing toast, not `alert()`.
- For input use a real form field or a dialog, not `prompt()`.

## Copy style
- Plain, easy-to-understand English.
- **No em-dash (—)** in customer-facing copy. Use a full stop or a comma.

## Git & shipping
- Don't push on every change. Batch work and push when a feature/batch is
  complete, or when the owner asks. Committing locally to save progress is fine.
- Never stage or commit secrets — check that no `.env` / `.env.local` files are
  staged before committing.
- Before pushing, run `npx tsc --noEmit` and a build; when a change is visible in
  the app, verify it in the browser preview.
- End commit messages with the Co-Authored-By trailer.

## Product & brand notes
- Brand palette: white / black / emerald (`#059669` primary, `#047857` dark)
  with `stone` neutrals. Tailwind v4.
- Money is stored in NGN (naira) as whole numbers, not kobo.
- Payments: Paystack. Auth: NextAuth v5. DB: MongoDB/Mongoose. Images: Cloudinary.

# Strictic — reference package for the Next.js rewrite

**Start with `STRICTIC-BUILD-GUIDE.md`** — it is the entry point that walks you
through the whole build and explains when to use which file.

Reading order: `STRICTIC-BUILD-GUIDE.md` → `STRICTIC-MVP.md` →
`strictic-blueprint.md` → `STRICTIC-ARCHITECTURE.md` → `STRICTIC-PROCEDURE.md` →
specific references.

**CLAUDE.md from this package belongs in the REPO ROOT** (next to package.json);
everything else goes in `docs/reference/`.

Workflow for Claude Code:

1. Drop this whole folder into the root of the new Next.js project (e.g. into
   `/docs/reference/`).
2. Tell Claude Code: "Read docs/reference/STRICTIC-BUILD-GUIDE.md and follow
   it."
3. Build top-down, screen by screen (see section 3 of the guide), Phase 1
   without a backend first.

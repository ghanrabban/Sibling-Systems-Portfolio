# Sibsys contributor guidance

The owner authorized a bilingual EN/ID portfolio derived from Navfolio, with placeholder content, local Docker and Workers Static Assets. Read `.agents/context/current-design.md`, `.agents/context/current-progress.md`, README and `docs/implementation-record.md`.

- Production is `app/` and `static/`; publication rules live in `src/lib/`. Retain upstream history/notices. Legacy starter/docs are reference material, not a second production mode.
- Keep monochrome white/black light styling and comfortable charcoal/off-white dark styling, responsive reading, keyboard navigation and usable no-JavaScript content. Visible upstream credit belongs in README, with required notices retained in license files.
- Keep locale, translation eligibility, date, route, feed and search behavior consistent. Preserve the source/publication boundary; drafts in a public Git repository are not confidential.
- Never commit credentials, caches, release outputs, private book files or browser reports. Preserve unrelated owner changes.
- Use frozen dependency installs and pinned Docker tools. Check `bun run test`, `bun run check`, `bun run format:check`, `bun run build`; verify visible behavior with `bun run test:browser` inside Docker. Publication-boundary changes also require `bun run test:publication`. Recheck performance after meaningful loading/layout changes.
- Source and static-asset deployment are separate. No automatic production deploy on Git push. Inspect account/domain bindings before a hosted change.
- Keep actual results and unverified acceptance items distinct. Do not claim full WCAG conformance, real-device or owner rehearsal results from automation.

The old Navfolio starter/docs build requirement is replaced by the owner's Sibsys-only production scope. Reproduce the upstream baseline from its audited commit in a separate checkout; do not route demo content into Sibsys.

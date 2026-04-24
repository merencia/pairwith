# Changelog

## [0.2.0] - 2026-04-24

### Added

- `DISCLAIMER.md` — project posture: no affiliation, no impersonation, no accuracy claims, right to removal
- `PROFILE_POLICY.md` — eligibility, consent tiers (authored / explicit permission / community homage), naming rules, content rules, safety rules, removal process
- `SECURITY.md` — threat model for profile-as-prompt, inspection guidance, reporting channel
- `CONTRIBUTING.md` — contribution guidelines with consent checklist for profile PRs
- `.github/pull_request_template.md` — PR checklist with consent tier declaration
- Safety notice printed to stderr before every `install` operation
- Unit tests for `resolver` and `validator` (21 tests, Vitest)

### Changed

- `README.md` — reframed from "make Claude behave like" to "AI style profiles inspired by public technical work"; added top-level disclaimer block; added "Are you referenced?" removal section
- `TEMPLATE.md` — mandatory non-impersonation header required in every profile; third-person framing throughout
- `AGENTS.md` — updated quality rules: header required, consent tier required, `generated_from` required for third-party profiles
- `skills/pair-with/SKILL.md` — "applies a style profile" not "adopt persona"; explicit safety refusal rules; assistant must not claim to be the referenced person
- `skills/create-profile/SKILL.md` — enforces public-only sources, mandatory non-impersonation header, `generated_from` metadata, saves to `profiles/` only inside the pairwith repo
- `profiles/caarlos0.md`, `profiles/merencia.md` — mandatory non-impersonation header added

### Removed

- `profiles/folke.md`, `profiles/theprimeagen.md`, `profiles/tjdevries.md`, `profiles/torvalds.md` — removed pending regeneration under updated `PROFILE_POLICY.md` guidelines
- `src/lib/installer.ts` — dead code; logic was already in `src/lib/adapters/claude.ts`
- Dead `url` variant from `Source` union type in `resolver.ts`

## [0.1.0] - 2026-04-01

- Initial release: `pairwith install`, `pairwith list`, `pairwith print`, Claude Code and Copilot adapters, official profile registry

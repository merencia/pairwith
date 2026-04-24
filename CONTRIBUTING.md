# Contributing

Thanks for considering a contribution. `pairwith` is an open-source, community project, and contributions — profiles, CLI fixes, docs improvements — are all welcome.

Before contributing, please skim:

- [`DISCLAIMER.md`](./DISCLAIMER.md) — how the project positions itself.
- [`PROFILE_POLICY.md`](./PROFILE_POLICY.md) — rules for contributing profiles.
- [`SECURITY.md`](./SECURITY.md) — how to think about profile safety.
- [`AGENTS.md`](./AGENTS.md) — ground rules for the CLI and repo.

## What kinds of contributions

**Profiles** — add yourself, add someone with explicit permission, or submit a respectful community homage following [`PROFILE_POLICY.md`](./PROFILE_POLICY.md).

**CLI fixes and features** — bug fixes, small UX improvements, new adapters for AI tools. For non-trivial features, open an issue first so we can align before you invest time.

**Docs** — clarifications, examples, translations, typo fixes.

## Contributing a profile

1. Start from [`TEMPLATE.md`](./TEMPLATE.md) — it includes the mandatory non-impersonation header and the required sections.
2. If the profile is about someone other than yourself, follow the consent tiers in [`PROFILE_POLICY.md`](./PROFILE_POLICY.md). Community homage is allowed when the framing is respectful and sources are public.
3. Fill in the frontmatter. For third-party homage profiles, include `generated` (today's date) and `generated_from` (every source URL you used).
4. Save the profile to `profiles/<handle>.md` and open a PR.

The PR template in this repo will ask you to confirm a short checklist. Please take it seriously — it is how we keep the bar consistent across contributors.

## Contributing CLI changes

- Run `pnpm install` to set up.
- `pnpm test` runs the unit tests. If you change behavior, add or update tests.
- `pnpm typecheck` must pass.
- `pnpm build` must succeed.
- Keep PRs focused. One concern per PR. Don't bundle a refactor with a bug fix.
- Follow the CLI UX rules in [`AGENTS.md`](./AGENTS.md): stdout for success output, stderr for progress and errors, clear exit codes, actionable error messages.

## Removal requests

If you are referenced by a profile and want it removed, renamed, or changed, you do **not** need to go through this contribution flow. Just open an issue, or a PR deleting the profile, and it will be prioritized. No justification needed.

## Profile contribution checklist

Copied from [`PROFILE_POLICY.md`](./PROFILE_POLICY.md) — the PR template will ask you to confirm these:

- [ ] The profile is based only on public technical material.
- [ ] The profile does not claim to be the real person.
- [ ] The profile does not imply endorsement, sponsorship, or affiliation.
- [ ] The profile does not include private or sensitive personal information.
- [ ] The profile is respectful and non-defamatory.
- [ ] The profile focuses on technical style, engineering principles, and public communication patterns.
- [ ] The profile includes the mandatory non-impersonation header.
- [ ] The profile includes `generated` and `generated_from` in the frontmatter if built from third-party sources.
- [ ] I understand that the profile may be removed if the referenced person requests it.

## Tone

The goal of this project is to learn from and admire technical styles that inspire us — respectfully. Keep contributions, reviews, and discussions respectful of the people referenced and of each other.

## Not legal advice

This document describes how contributions are accepted. It is not legal advice.

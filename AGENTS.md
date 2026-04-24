# AGENTS.md

Ground rules for any agent (or human) working in this repo. Read this before editing anything.

## What this repo is

An open-source CLI (`pairwith`) plus a registry of dev "profiles" — markdown files that make Claude behave like a specific developer during pair programming.

- The CLI is infrastructure: it must be small, predictable, and safe.
- Profiles are community content: they must pass quality and consent checks.

## Pair programming rules

1. Don't edit code without explicit confirmation.
2. Before acting, state briefly what will change, where, and why.
3. Work in small steps. Don't make changes outside the requested scope.
4. Ask when genuinely unsure. Don't guess at contracts (command names, flags, output format).

## Test-first when there's an issue

When working from an issue: write the tests first, open a draft PR with just the tests, get alignment, then implement. Skip this flow for trivial changes.

## CLI UX (non-negotiable)

- Success output → `stdout`. Errors and progress → `stderr`.
- Exit `0` on success, `1` on user error (bad input, not found), `2` on unexpected error.
- User errors get a clear, actionable message. No stack traces unless `--verbose`.
- `--help` is authoritative documentation — keep it current.
- Respect `NO_COLOR`. Don't assume Unicode support.

## Safety

- A profile is a prompt. The CLI **never executes** profile content — it only writes files.
- Never write outside `~/.claude/agents/` unless the user passes `--path` explicitly.
- Never overwrite an existing file without confirmation, unless `--force`.
- Every network call has a timeout and a size limit. Sanitize any handle/URL before using it.
- Never log tokens, credentials, or third-party transcript content.

## Profile quality (for the official registry)

Profiles merged into `profiles/` must have:
- `name` and `description` in the frontmatter
- sections for Principles, Decision heuristics, Tone, and Dialogue examples (≥ 2)
- explicit author consent in the PR description
- no leaked PII in the examples

## AI presence

Don't add AI co-authorship to commits. Don't mention AI in commit messages, PR descriptions, or code comments. The exception is the `profiles/` directory itself — those files are prompts by design.

## Language

All repo artifacts (docs, code, commits, PRs) are in English.

---
name: create-profile
description: Generate a community AI style profile for pairwith — a respectful homage inspired by publicly observable aspects of a developer's technical work. Follows TEMPLATE.md, PROFILE_POLICY.md, and DISCLAIMER.md.
---

# create-profile

Generate a `profiles/<handle>.md` style profile ready to submit to `pairwith`, following the project's policy.

## What this skill generates (and what it does not)

This skill creates a **community AI style profile** — a set of prompt instructions inspired by publicly observable aspects of a developer's technical work. A profile is **not** the real person, does not represent them, and is not endorsed by or affiliated with them unless explicitly stated and documented.

Before generating anything, read or re-read:

- [`TEMPLATE.md`](../../TEMPLATE.md) — the required structure and mandatory non-impersonation header.
- [`PROFILE_POLICY.md`](../../PROFILE_POLICY.md) — eligibility, consent tiers, naming, content, and safety rules.
- [`DISCLAIMER.md`](../../DISCLAIMER.md) — the overall project posture.

If you cannot read these files (e.g. running outside the repo), apply the principles summarized below from memory.

## Invocation

```
/create-profile [github-handle] [urls...] [file-path]
```

Examples:
```
/create-profile
/create-profile caarlos0
/create-profile caarlos0 carlosbecker.com linkedin.com/in/caarlos0
/create-profile merencia merencia.com ./notes-about-my-style.md
/create-profile caarlos0 https://github.com/caarlos0/dotfiles/blob/main/skills/pair-with-caarlos0/SKILL.md
```

## Step 1 — gather inputs

Parse the invocation arguments:

- **GitHub handle**: the first word if it doesn't start with `http`, `/`, or `.`. If not provided, ask: _"What's the GitHub handle for this profile?"_
- **URLs**: any argument starting with `http` or a bare domain. Only accept URLs that are clearly public (personal sites, blogs, LinkedIn public pages, public talks, public articles, public repositories).
- **File path**: any argument starting with `/`, `./`, or ending in `.md` or `.txt`. Read the file contents. Only use content that is plainly public or provided by the user about themselves.

If no URLs and no file are provided after getting the handle, ask:
_"Any useful public links or a reference file? (personal site, public LinkedIn, blog, public talks, existing public style guide, etc.) — or just press enter to generate from public GitHub alone."_

**Refuse to use** any source that appears to be private, leaked, non-public, or that the user does not have the right to share. If in doubt, ask.

## Step 2 — collect source material

Fetch and read all available public sources in parallel:

1. **GitHub profile** — `https://github.com/<handle>`: public bio, pinned repos, languages, notable projects.
2. **GitHub repos** — skim the top pinned/starred repos for public README content, tech stack signals, and how the developer describes their own public work.
3. **Each provided URL** — fetch full content. Only extract publicly visible information. Do not fabricate or infer private details from public context.
4. **Provided file** — read in full. If it's an existing public style guide or pair-with file the developer authored, treat it as the most authoritative source for tone and heuristics.

If a fetch fails, note it and continue with what's available.

## Step 3 — analyze and synthesize

Identify the following from public sources. Be specific, but only with material that is publicly observable. Do not speculate about private beliefs, opinions on unrelated topics, personal attributes, or anything sensitive (health, family, politics, religion, ethnicity, sexuality, finances, location, etc.).

**Principles**: technical values the developer emphasizes in public work. Look for repeated emphasis in their writing, commit messages, code review comments, or talks.

**Decision heuristics**: how they choose between technical options — tie-breakers and defaults they explicitly name in public.

**Tone and communication** (in public technical contexts): short or verbose, use of humor, direct or diplomatic. Draw from public writing style.

**Typical reasoning**: any stated workflow in their public material — "first I do X, then Y".

**Anti-patterns**: what they publicly push back on in code, reviews, or process.

**Stack**: what they reach for in public work.

**Dialogue examples**: realistic illustrative exchanges that reflect the profile's public technical voice. These are **not** verbatim quotes. Mark them as illustrative. Do not attribute specific opinions to the real person that you cannot back with public sources.

## Step 4 — write the profile

Follow [`TEMPLATE.md`](../../TEMPLATE.md) exactly.

**Required top matter** — include in this order:

1. Frontmatter (`name`, `description`, `model`, and for third-party homage profiles also `generated` and `generated_from`).
2. The mandatory non-impersonation header, verbatim from the template. Do not skip, paraphrase, or weaken it.

**Frontmatter rules:**

- `name`: the developer's public GitHub handle, lowercase. This is nominative — it identifies the inspiration source.
- `description`: frame as a style profile inspired by public work. Good: _"A style profile inspired by X's public technical writing — empirical, test-first, direct."_ Avoid: _"You are X."_ / _"The X agent."_ / _"Be X."_
- `model`: `sonnet` by default.
- `generated`: today's date in `YYYY-MM-DD` (only for profiles built from third-party public sources).
- `generated_from`: list of public source URLs actually used (only for profiles built from third-party sources). Omit both fields when the profile is authored by the subject themselves.

**Required sections, in this order:**

```
# Principles
# Decision heuristics
# Tone and communication
# Typical reasoning
# Anti-patterns
# Stack and preferences
# Dialogue examples   ← minimum 2, aim for 4-5
# Author context
```

**Framing rules (apply to every section):**

- **Do not write in the first person as the developer.** Avoid _"I believe…"_, _"My opinion is…"_, _"I would definitely…"_.
- Prefer third-person style-profile framing: _"This profile emphasizes…"_, _"Under this profile, the assistant should…"_, _"Responses under this profile tend to…"_.
- Dialogue examples are labeled as illustrative, not verbatim quotes. Never present them as what the real person said.
- Do **not** fabricate biographical details, private opinions, employer information beyond what is public, quotes, or personal anecdotes.
- Do **not** include offensive, defamatory, mocking, or invasive content.
- Do **not** include instructions that bypass laws, licenses, safety rules, privacy protections, or platform rules.
- Do **not** include content that could be used to impersonate the person in a deceptive way.

**Quality bar for dialogue examples:**

- Each example has a realistic user prompt and a response written in the profile's public voice.
- Responses sound grounded in public engineering communication, not generic AI output.
- Cover multiple scenarios (feature request, code review, design question, debugging, disagreement).
- If the sources have clear, public, recurring opinions, reflect them — attributed to the profile, not to the real person.

**What to avoid:**

- Generic statements that could apply to any senior engineer.
- Padding. If a section can't be filled from public sources, keep it short rather than inventing.
- Inventing opinions. If it isn't in the sources, don't make it up.
- Private or sensitive personal information.

## Step 5 — present and confirm

Output the generated profile in a code block, then ask:

_"Does this look right? Worth checking: (1) dialogue examples reflect public style without being presented as direct quotes, (2) anti-patterns are grounded in public material, (3) nothing private or sensitive snuck in, (4) the non-impersonation header is present. Want to adjust anything before saving?"_

**On confirm, save:**

1. `~/.claude/agents/<handle>.md` — so the profile is immediately available via `/pair-with`.
2. `profiles/<handle>.md` in the current repo — **only** if the current working directory is the `pairwith` registry repo (i.e. a `profiles/` directory exists at root and the repo is `merencia/pairwith`). Do not create a `profiles/` directory in an unrelated project.

Before saving, ensure the frontmatter has `generated` (today's date, YYYY-MM-DD) and `generated_from` (the URLs actually fetched) if the profile was built from third-party sources. Omit both fields when the profile is written by the subject.

If the user wants changes, apply them and present the updated version.

## Notes to the user

Include these reminders in your presentation, where applicable:

- If the profile is about someone other than the user: _"This is a community homage. Before submitting it to the official registry, follow [`PROFILE_POLICY.md`](../../PROFILE_POLICY.md) — especially the consent tier in the PR description. If the referenced person requests removal, the profile will be removed."_
- If the source material is sparse (public GitHub only, few repos, no links): _"I had limited public material. The dialogue examples are inferred from style signals rather than observed directly. Review them carefully and do not submit as a community homage unless you're confident they reflect public technical voice, not invention."_
- Always: _"A profile is a style approximation, not the real person. It does not speak for them and does not imply endorsement."_

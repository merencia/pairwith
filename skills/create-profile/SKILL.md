---
name: create-profile
description: Generate a developer profile for pairwith from a GitHub handle, links, and optional reference text or file. Follows TEMPLATE.md. Use when someone wants to create their own profile or generate one for a developer they know well.
---

# create-profile

Generate a `profiles/<handle>.md` file ready to submit to pairwith.

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
- **URLs**: any argument starting with `http` or a bare domain (e.g. `carlosbecker.com`). These are links to fetch — personal site, blog, LinkedIn, or any reference page.
- **File path**: any argument starting with `/`, `./`, or ending in `.md` or `.txt`. Read the file contents.

If no URLs and no file are provided after getting the handle, ask:
_"Any useful links or a reference file? (personal site, LinkedIn, blog, existing SKILL.md, etc.) — or just press enter to generate from GitHub alone."_

## Step 2 — collect source material

Fetch and read all available sources in parallel:

1. **GitHub profile** — `https://github.com/<handle>`: bio, pinned repos, languages, follower count, notable projects.
2. **GitHub repos** — skim the top pinned/starred repos for README content, tech stack, coding style signals, and how they describe their own projects.
3. **Each provided URL** — fetch full content. If it's a LinkedIn page, extract: current role, past roles, skills, publications, recommendations quotes.
4. **Provided file** — read in full. If it's a SKILL.md or similar style guide, treat it as the most authoritative source for tone, heuristics, and anti-patterns.

If a fetch fails, note it and continue with what's available.

## Step 3 — analyze and synthesize

Before writing, identify the following from the collected sources. Be specific — vague profiles are useless.

**Principles**: What does this person treat as non-negotiable? Look for repeated emphasis, strong statements, things they push back on consistently.

**Decision heuristics**: How do they choose between options? Look for tie-breakers, defaults, rules of thumb they explicitly name.

**Tone**: How do they write? Short or verbose? Do they use humor? Are they direct or diplomatic? Pull actual phrasing from their writing when possible.

**Typical reasoning**: What order do they approach problems? Look for any stated workflow — "first I do X, then Y".

**Anti-patterns**: What annoys them? What do they explicitly avoid or call out in code, reviews, process?

**Stack**: What do they actually use day-to-day? Not just what they know — what they reach for by default.

**Dialogue examples**: Reconstruct realistic exchanges from what you know about their style. Base these on:
- how they respond to feature requests
- how they give code review feedback
- how they handle disagreement or pushback
- their characteristic phrasing and rhythm

If the source material includes a SKILL.md, pair-with file, or extensive writing, the dialogue examples should closely mirror the actual voice — not a generic approximation.

## Step 4 — write the profile

Follow `TEMPLATE.md` exactly. All sections in order:

```
frontmatter (name, description, model)
# Principles
# Decision heuristics
# Tone and communication
# Typical reasoning
# Anti-patterns
# Stack and preferences
# Dialogue examples   ← minimum 2, aim for 4-5
# Author context
```

**Frontmatter rules:**
- `name`: the GitHub handle, lowercase
- `description`: one sentence — style summary + what this profile is good for. Example: _"Pair session in X's style — [2-3 adjectives]. Good for [specific use cases]."_
- `model`: `sonnet`

**Quality bar for dialogue examples:**
- Each example has a realistic user prompt and a response in their voice.
- The response should sound like *them*, not like a generic AI. Use their vocabulary, sentence length, and attitude.
- Cover different scenarios: feature request, code review, design question, debugging, disagreement.
- If the source has direct quotes or strong opinions, reflect those.

**What to avoid:**
- Generic statements that could apply to any senior engineer ("I care about code quality", "I value good tests").
- Padding. If there's nothing specific to say about a section, keep it short and concrete rather than filling it with platitudes.
- Inventing opinions not supported by the sources. If something isn't there, don't make it up — leave the section sparse or skip optional parts.

## Step 5 — present and confirm

Output the generated profile in a code block, then ask:

_"Does this look right? A few things worth checking: (1) the dialogue examples capture your actual voice, (2) the anti-patterns are specific to you, not generic. Want to adjust anything before saving?"_

If the user confirms, save to `~/.claude/agents/<handle>.md` — so the profile is immediately available via `/pair-with`.

Additionally, if the current working directory is the pairwith registry repo (i.e. a `profiles/` directory exists at the root and the repo is `merencia/pairwith`), also save to `profiles/<handle>.md` for registry submission.

Before saving, add these fields to the frontmatter (after `model:`):

```yaml
generated: <today's date in YYYY-MM-DD>
generated_from:
  - <each URL fetched as a source>
```

Only include URLs that were actually fetched and contributed to the profile. Omit `generated` and `generated_from` if the profile was written by the subject themselves.

If the user wants changes, apply them and present the updated version.

## Notes

- If the handle belongs to someone other than the user, note at the end: _"If this profile is for someone else, make sure you have their consent before submitting to the official registry."_
- If the source material is sparse (GitHub profile only, few repos, no links), say so: _"I had limited material to work with — the dialogue examples especially are inferred rather than observed. Review them carefully before publishing."_

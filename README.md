# pairwith

An open-source collection of **AI style profiles** inspired by public technical work from developers and technical leaders we admire. Each profile is a respectful, fictionalized homage — a set of prompt instructions that shapes how an AI coding assistant communicates, reasons about trade-offs, and frames feedback, inspired by publicly observable aspects of a developer's engineering style.

Works with **Claude Code**, **GitHub Copilot**, **Cursor**, and any tool that accepts a system prompt.

> **Please read:** `pairwith` profiles are not the real people they reference. A profile is not endorsed, reviewed, approved, sponsored, or affiliated with the referenced person unless explicitly stated. Profiles are based only on public material, community interpretation, and admiration. They are intended for education, inspiration, and developer workflow experimentation. Please do not use `pairwith` to deceive, impersonate, harass, defame, or misrepresent anyone. See [`DISCLAIMER.md`](./DISCLAIMER.md) for the full project posture.

> AI pair programming today tends toward a single average, cautious, personality-free style. Pairing with a developer you admire is valuable precisely because of *how* they approach problems — the order in which they prioritize trade-offs, the questions they ask first, the things they push back on. `pairwith` lets a style like that be captured as a versionable prompt and re-used across AI tools.

---

## How it works

1. **Share your style** → write `profiles/<your-handle>.md` following [`TEMPLATE.md`](./TEMPLATE.md) and open a PR to the official registry. Or host it in your own GitHub repo.
2. **Try a profile** → run `npx pairwith install <handle>` and the profile is written to your local AI tool's configuration directory.
3. **During a session**, the assistant uses that profile's principles, heuristics, and communication style to frame its responses. It is not the referenced person; it is an assistant following the profile's guidance.

Profiles are plain Markdown with YAML frontmatter. No custom runtime, no server — just files. The CLI handles writing each profile into the format each tool expects.

---

## Two ways to use a profile

### 1. As a subagent (persistent session)

Install a profile and select it from the Claude Code `/agents` picker. The assistant uses that profile's style for the session.

### 2. As a skill (inline, per-task)

Use any installed profile on the fly without switching sessions:

```bash
/pair-with merencia review these changes
/pair-with caarlos0 what do you think about this API design?
/pair-with alice help me write this migration
```

The assistant reads the profile for that handle and responds using its style — the heuristics, tone, and typical reasoning — for that specific task. Again: the assistant is not the person, and does not speak for them.

---

## Creating a profile with AI

Use the `create-profile` skill to generate a draft from a GitHub handle, public links, and optional reference material you provide:

```bash
/create-profile
/create-profile caarlos0
/create-profile caarlos0 carlosbecker.com linkedin.com/in/caarlos0
/create-profile merencia merencia.com ./my-style-notes.md
/create-profile caarlos0 https://github.com/caarlos0/dotfiles/blob/main/skills/pair-with-caarlos0/SKILL.md
```

The skill asks for a GitHub handle if not provided, fetches the public profile, repos, and any URLs you pass, reads any local file, and generates a draft `profiles/<handle>.md` following the template — including the mandatory non-impersonation header. You review and adjust it before saving. See [`PROFILE_POLICY.md`](./PROFILE_POLICY.md) for the rules it follows.

---

## Getting started

### `install` — bootstrap everything at once

```bash
npx pairwith install
```

Run without arguments to leave everything ready to use and ready to contribute:

1. Creates `~/.claude/agents/` and `~/.claude/skills/` if they don't exist
2. Installs the `pair-with` and `create-profile` skills globally
3. Lists available official profiles and asks which ones to install (or pass `--all`)
4. Asks for your GitHub handle and scaffolds `profiles/<handle>.md` from the template — ready to fill in and open a PR
5. Prints a summary and next steps

```bash
npx pairwith install --all          # install all official profiles without prompting
npx pairwith install --skip-profile # skip profile scaffolding
```

---

## CLI

```bash
# Bootstrap everything (skills + profiles + scaffold your own)
npx pairwith install

# Install for all detected tools (Claude Code, Cursor, etc.)
npx pairwith install merencia

# Install for a specific tool
npx pairwith install merencia --for claude
npx pairwith install merencia --for copilot   # writes ~/.copilot/agents/merencia.agent.md
npx pairwith install merencia --for cursor    # writes ~/.cursor/rules/merencia.mdc
npx pairwith install merencia --for all

# External repo (profile hosted in someone's own repo)
npx pairwith install user/my-profile

# External collection repo (pick a specific handle)
npx pairwith install user/profiles-repo#alice

# Full URL also works
npx pairwith install https://github.com/user/repo

# Preview a profile before installing — recommended for external sources
npx pairwith print <source>
```

Always a good idea with an external source: run `npx pairwith print <source>` first, read it, and make sure it only contains what you'd expect in a style profile. Profiles are prompt instructions — see [`SECURITY.md`](./SECURITY.md).

### How the CLI resolves the source

| Format | Resolution |
|---|---|
| `<handle>` (no `/`) | Official registry → `merencia/pairwith/profiles/<handle>.md` |
| `<user>/<repo>` | External repo. Layout auto-detected. |
| `<user>/<repo>#<handle>` | External collection; picks the specified handle. |
| Full GitHub URL | Same logic, direct. |

### Tool adapters

| `--for` | Where it installs | Auto-detected? |
|---|---|---|
| `claude` | `~/.claude/agents/<name>.md` | Yes, if `~/.claude/` exists |
| `cursor` | `~/.cursor/rules/<name>.mdc` | Yes, if `~/.cursor/` exists |
| `copilot` | `~/.copilot/agents/<name>.agent.md` | Yes, if `~/.copilot/` exists |
| `all` | All of the above | — |

If no `--for` is passed, the CLI installs for all auto-detected tools. If nothing is detected, defaults to Claude Code.

Invoke an installed Copilot agent with `copilot --agent=<name> "<task>"` (or `/agent` interactively).

### Layout detection (external repos)

When fetching an external repo, the CLI looks in this order:
1. `profile.md` at root → single-profile repo
2. `.claude/agents/*.md` → extracts from there
3. `profiles/<handle>.md` → collection repo (requires `#handle` if multiple)
4. Single `.md` with valid frontmatter at root → uses that

If nothing matches, fails with a clear message explaining the accepted layouts.

### Other commands

```bash
npx pairwith list                         # list available official profiles
npx pairwith search <term>                # search by name
npx pairwith installed                    # show installed profiles across all tools
npx pairwith installed --for cursor       # filter by tool
npx pairwith remove <handle>              # remove from all detected tools
npx pairwith remove <handle> --for claude # remove from a specific tool
npx pairwith update <handle>              # update an installed profile
npx pairwith print <handle>               # print profile body to stdout (good for inspection)
```

### What `install` does, step by step

1. Resolves the argument → determines the source (official registry vs. external repo).
2. Shallow-fetches the content (no full `git clone` — via `raw.githubusercontent.com` when possible, GitHub API otherwise).
3. Validates YAML frontmatter (`name` and `description` required) and required sections.
4. Shows a short safety notice the first time per session, then writes to the tool-specific directory.
5. Prints: `✓ Installed.`

Conflicts (profile already installed) prompt for confirmation before overwriting, unless you pass `--force`.

---

## Profile format

```markdown
---
name: merencia
description: A style profile inspired by Merencia's public technical writing — pragmatic, refactor-first, direct.
model: sonnet
---

> **Non-impersonation notice.** This is a community-created AI style profile inspired by publicly observable aspects of technical work associated with the named developer. It is not the real person, does not represent them, and is not endorsed by or affiliated with them unless explicitly stated.

# Principles
...

# Decision heuristics
...

# Tone and communication
...

# Dialogue examples
...
```

### Template sections

| Section | Required? | What to put |
|---|---|---|
| **Non-impersonation notice** | **yes** | The standard header from [`TEMPLATE.md`](./TEMPLATE.md). Do not skip. |
| **Principles** | yes | Non-negotiable technical values the profile emphasizes ("this profile prefers explicit code over magic"). |
| **Decision heuristics** | yes | How the profile chooses between options ("when in doubt between abstracting and duplicating, this profile prefers duplication until the third occurrence"). |
| **Tone and communication** | yes | Formal/informal, verbose/terse, direct/diplomatic — how the profile should sound. |
| **Typical reasoning** | recommended | The order in which the profile approaches a new problem. |
| **Anti-patterns** | recommended | What the profile avoids in code, reviews, or process. |
| **Stack and preferences** | recommended | Languages, frameworks, and tools the profile defaults to. |
| **Dialogue examples** | **yes (min. 2)** | Realistic illustrative exchanges — **not** verbatim quotes. These teach the assistant the profile's style most effectively. |
| **Author context** | optional | Public biographical context. No private information. |

See [`PROFILE_POLICY.md`](./PROFILE_POLICY.md) for the full set of rules.

---

## Are you referenced by a profile?

If a profile here references your work and you'd prefer it be removed, renamed, reframed, or otherwise changed — [open an issue](https://github.com/merencia/pairwith/issues) or a PR deleting `profiles/<your-handle>.md`.

- The purpose of this project is admiration and learning. If that framing does not work for you, the framing loses.
- Removal requests from the referenced person will be prioritized, handled respectfully, and do not require justification.
- Disputed profiles may be temporarily removed while reviewed.
- No endorsement is implied by the presence of a profile, and nothing here is affiliated with your employer, your organizations, or your person unless the profile explicitly says so.

---

## Creating your own profile

Three paths, from most manual to most automated:

1. **`/create-profile`** *(recommended)* — run the skill in Claude Code. Pass your GitHub handle and any useful links. The AI fetches your public profile, repos, and references, then generates a draft following the template. You review and adjust before saving.
2. **Fill in the template** — complete [`TEMPLATE.md`](./TEMPLATE.md) directly. More work, most faithful.
3. **Get interviewed by an AI** — ask an AI you talk to often (Claude, ChatGPT) to summarize your reasoning, decisions, and tone based on conversation history. Suggested prompt:
   > "Based on our conversations, describe my technical reasoning, decision-making heuristics, tone, and what bothers me in code. Use concrete examples when possible."

The best source of a profile is the **Dialogue examples** section. Paste real conversations — editing out sensitive info — rather than trying to describe your style in the abstract.

---

## Project principles

- **Public data, respectful framing** — profiles are based only on public technical material (open-source contributions, public writing, public talks, documentation). Framing is always a homage, never a claim of identity. See [`PROFILE_POLICY.md`](./PROFILE_POLICY.md).
- **Not a quote, not a spokesperson** — profiles capture an approximation of style. They do not represent the referenced person's actual statements, opinions, or positions. Do not quote a profile as if it were a direct statement from the person.
- **Right to removal** — referenced people can request removal, rename, or reframing at any time. No justification required.
- **No malicious impersonation** — profiles must not be used to deceive, defame, harass, or facilitate fraud. See [`DISCLAIMER.md`](./DISCLAIMER.md).
- **Profiles are prompts, not trusted code** — the CLI never executes profile content, but the assistant will follow the instructions inside it. Inspect profiles before installing. See [`SECURITY.md`](./SECURITY.md).
- **Zero proprietary infrastructure** — the CLI consumes GitHub directly; the "official registry" is just the `profiles/` directory in this repo. No server, no database, no account.

## Non-goals

- Not a clone of the referenced developer. It is a style approximation based on public material.
- Not a repository of generic prompts like "you are a senior engineer…". Profiles here are specific to public technical work.
- Not a marketplace. Everything is free and open.

---

## Roadmap

- [x] `TEMPLATE.md` v1 with non-impersonation header
- [x] Reference profiles (`profiles/merencia.md`, `profiles/caarlos0.md`, etc.)
- [x] Skills: `pair-with`, `create-profile` (Claude Code)
- [x] CLI v1 — `install`, `list`, `search`, `installed`, `remove`, `update`, `print`
- [x] Multi-tool adapters: Claude Code, Cursor, GitHub Copilot
- [x] Published to npm as `pairwith`
- [ ] `inspect` command — preview profile content with a highlighted summary before install
- [ ] `--dry-run`, `--path <custom-dir>` flags
- [ ] Profile versioning (`merencia@v2` as the developer evolves)
- [ ] Support for clients beyond the current adapters
- [ ] Verified-profile marker when explicit consent is on file

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Quick summary:

- **Profiles** — open a PR with `profiles/<handle>.md` following [`TEMPLATE.md`](./TEMPLATE.md). Include at least 2 dialogue examples and the mandatory non-impersonation header. Declare the consent tier in the PR description.
- **CLI / docs** — bug fixes and small features welcome. Open an issue first for anything non-trivial.

If you prefer to host your profile in your own repo, no PR is needed — anyone can install it via `npx pairwith install <user>/<repo>`.

---

## Related documents

- [`DISCLAIMER.md`](./DISCLAIMER.md) — project posture, no affiliation, no impersonation, removal on request.
- [`PROFILE_POLICY.md`](./PROFILE_POLICY.md) — rules for creating and contributing profiles.
- [`SECURITY.md`](./SECURITY.md) — how to think about profile safety (profiles are prompts).
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — how to contribute code, docs, or profiles.
- [`AGENTS.md`](./AGENTS.md) — ground rules for anyone (human or AI) working in this repo.

## License

MIT for the repository infrastructure (CLI + structure). Each profile's content belongs to its author; authors may add a usage note at the top of their own file.

---

> This project is maintained as an open-source community tool. These policies are intended to encourage respectful use, but they are not legal advice. If you are building on top of `pairwith`, distributing it commercially, or have a specific legal question, consult a qualified attorney.

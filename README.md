# pairwith

An open-source collection of **developer profiles** for AI pair programming. Each profile captures how a person thinks, their tone, and their decision-making heuristics — installing a profile makes your AI coding tool behave like that developer during the session.

Works with **Claude Code**, **GitHub Copilot**, **Cursor**, and any tool that accepts a system prompt.

> AI pair programming today is generic: the model has an average, cautious, personality-free style. Pairing with a human is valuable precisely because of *how* they think — the order in which they approach problems, the trade-offs they prioritize, their tone, their quirks. This project lets you export that style as a versionable file, and lets anyone pair with developers whose style they admire.

---

## How it works

1. **Share your style** → write `profiles/<your-handle>.md` following `TEMPLATE.md` and open a PR to the official registry. Or host it in your own GitHub repo.
2. **Pair with someone** → run `npx pairwith install <handle>` and you're done — the profile shows up in Claude Code.
3. During the session, Claude responds with that developer's reasoning, tone, and heuristics.

Profiles are plain Markdown with YAML frontmatter. No custom runtime, no server — just files. The CLI handles translating each profile into the format each tool expects.

---

## Two ways to use a profile

### 1. As a subagent (persistent session)

Install a profile and select it from the Claude Code `/agents` picker. Claude adopts that persona for the entire session.

### 2. As a skill (inline, per-task)

Use any profile on the fly without switching sessions:

```bash
/pair-with merencia review these changes
/pair-with caarlos0 what do you think about this API design?
/pair-with alice help me write this migration
```

Claude reads the profile for that handle and responds as that developer — their reasoning, tone, and heuristics — for that specific task.

---

## Creating a profile with AI

Use the `create-profile` skill to generate a profile from a GitHub handle, links, and optional reference material:

```bash
/create-profile
/create-profile caarlos0
/create-profile caarlos0 carlosbecker.com linkedin.com/in/caarlos0
/create-profile merencia merencia.com ./my-style-notes.md
/create-profile caarlos0 https://github.com/caarlos0/dotfiles/blob/main/skills/pair-with-caarlos0/SKILL.md
```

The skill asks for a GitHub handle if not provided, fetches the profile, repos, and any URLs you pass, reads any local file, and generates a complete `profiles/<handle>.md` following the template. It presents a draft for you to review before saving.

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

# Print profile body to stdout — pipe into any tool
npx pairwith print merencia
```

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
npx pairwith list                        # list available official profiles
npx pairwith search <term>               # search by name
npx pairwith installed                   # show installed profiles across all tools
npx pairwith installed --for cursor      # filter by tool
npx pairwith remove <handle>             # remove from all detected tools
npx pairwith remove <handle> --for claude # remove from a specific tool
npx pairwith update <handle>             # update an installed profile
npx pairwith print <handle>              # print profile body to stdout
```

### What `install` does, step by step

1. Resolves the argument → determines the source (official registry vs. external repo).
2. Shallow-fetches the content (no full `git clone` — via `raw.githubusercontent.com` when possible, GitHub API otherwise).
3. Validates YAML frontmatter (`name` and `description` required).
4. If the profile references auxiliary files (skills, hooks, examples) in an `assets/` folder, copies those too.
5. Copies to `~/.claude/agents/<name>.md`.
6. Prints: `✓ Installed. Open Claude Code and run /agents to select "<name>".`

Conflicts (profile already installed) prompt for confirmation before overwriting, unless you pass `--force`.

---

## Profile format

```markdown
---
name: merencia
description: When Claude should invoke this agent (e.g. "pair session in Merencia's style — pragmatic, refactor-first, direct tone")
model: opus
---

# Principles
...

# How I make decisions
...

# Tone and communication
...

# Anti-patterns (what I avoid)
...

# Dialogue examples
...
```

### Template sections

| Section | Required? | What to put |
|---|---|---|
| **Principles** | yes | Non-negotiable technical values ("I prefer explicit code over magic", "integration tests over unit tests for business logic") |
| **Decision heuristics** | yes | How you choose between options ("when in doubt between abstracting and duplicating, I duplicate until the third occurrence") |
| **Tone and communication** | yes | Formal/informal, verbose/terse, use of humor, how you give feedback |
| **Typical reasoning** | recommended | The order in which you approach a new problem |
| **Anti-patterns** | recommended | What annoys you in code, reviews, or process |
| **Stack and preferences** | recommended | Languages, frameworks, and tools you know well |
| **Dialogue examples** | **yes (min. 2)** | Real or fabricated transcripts showing you solving something. **This is what teaches the model your style most effectively.** |
| **Author context** | optional | Years of experience, domains, links |

---

## Repository structure

```
pairwith/
├── README.md
├── AGENTS.md
├── TEMPLATE.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── package.json              # npm package (name: pairwith)
├── bin/
│   └── pairwith       # CLI entrypoint
├── skills/
│   ├── pair-with/
│   │   └── SKILL.md              # the /pair-with skill
│   └── create-profile/
│       └── SKILL.md              # the /create-profile skill
├── src/
│   ├── index.ts
│   ├── commands/
│   │   ├── install.ts        # no args = bootstrap, with arg = install profile
│   │   ├── list.ts
│   │   ├── search.ts
│   │   ├── installed.ts
│   │   ├── remove.ts
│   │   └── update.ts
│   └── lib/
│       ├── resolver.ts       # arg → concrete source
│       ├── fetcher.ts        # GitHub content download
│       ├── validator.ts      # frontmatter + required sections
│       └── installer.ts      # writes to ~/.claude/agents/
├── tests/
├── fixtures/
├── profiles/                 # official registry
└── examples/                 # transcripts showing profiles in action
```

---

## Creating your profile

Three paths, from most manual to most automated:

1. **`/create-profile`** *(recommended)* — run the skill in Claude Code. Pass your GitHub handle and any useful links. The AI fetches your public profile, repos, and references, then generates a draft following the template. You review and adjust before saving.
2. **Fill in the template** — complete `TEMPLATE.md` directly. More work, most faithful.
3. **Get interviewed by an AI** — ask an AI you talk to often (Claude, ChatGPT) to summarize your reasoning, decisions, and tone based on conversation history. Suggested prompt:
   > "Based on our conversations, describe my technical reasoning, decision-making heuristics, tone, and what bothers me in code. Use concrete examples when possible."

The best source of personality is the **Dialogue examples** section. Paste real conversations — editing out sensitive info — rather than trying to describe your style in the abstract.

---

## Project principles

- **Public data, honest attribution** — profiles may be generated from public material the author has published (GitHub, blog posts, talks, articles). The profile makes clear who the subject is and that it's an *approximation*, not the real person.
- **Not a quote, not a spokesperson** — profiles capture reasoning style and heuristics. They do not represent the subject's actual statements or opinions. Do not quote a profile as if it were something the person said.
- **Right to removal** — if you find a profile of yourself here and don't want it, [open an issue](https://github.com/merencia/pairwith/issues) or a PR removing `profiles/<your-handle>.md` and it will be removed promptly, no questions asked.
- **No malicious impersonation** — profiles must not impersonate people to deceive or facilitate fraud.
- **Quality over quantity** — profiles without dialogue examples don't enter the official registry.
- **Zero proprietary infrastructure** — the CLI consumes GitHub directly; the "official registry" is just the `profiles/` directory in this repo. No server, no database, no account.

## Non-goals

- Not a perfect clone of the developer. It's a style approximation.
- Not a repository of generic prompts like "you are a senior engineer...". Profiles here are *personal*.
- Not a marketplace. Everything is free and open.

---

## Roadmap

- [x] `TEMPLATE.md` v1
- [x] Reference profiles (`profiles/merencia.md`, `profiles/caarlos0.md`)
- [x] Skills: `pair-with`, `create-profile` (Claude Code)
- [x] CLI v1 — `install`, `list`, `search`, `installed`, `remove`, `update`, `print`
- [x] Multi-tool adapters: Claude Code, Cursor, GitHub Copilot
- [ ] Publish to npm as `pairwith`
- [ ] `--force`, `--dry-run`, `--path <custom-dir>` flags
- [ ] `generate` — profile generation from commit/PR history
- [ ] Profile versioning (`merencia@v2` as the developer evolves)
- [ ] Support for clients beyond Claude Code (direct API, SDK, other providers)
- [ ] "Composer" — combine 2 profiles in the same session

---

## Contributing

Read `CONTRIBUTING.md`. Summary:

- Open a PR with `profiles/<your-handle>.md` following `TEMPLATE.md`.
- Include **at least 2 dialogue examples**.
- State authorship and consent in the PR description.
- The community reviews before merge (style, example quality, consent).

If you prefer to host your profile in your own repo, no need to open a PR here — anyone can install it via `npx pairwith install <user>/<repo>`.

---

## License

MIT for the repository infrastructure (CLI + structure). Each profile belongs to its author — authors may add an additional usage note at the top of their own file.

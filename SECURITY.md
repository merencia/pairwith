# Security Policy

## What `pairwith` installs

`pairwith` is a CLI that writes text-based AI profile files (Markdown with YAML frontmatter) to local directories used by AI coding tools — for example, `~/.claude/agents/`, `~/.cursor/rules/`, or `.github/copilot-instructions.md`.

The CLI itself **does not execute** profile content. It fetches the Markdown, validates it, and writes it to disk.

## The risk profiles carry

Profiles are **prompt instructions**. When an AI assistant reads an installed profile, it follows the guidance inside it. This is the intended behavior — profiles shape style, heuristics, and communication — but it also means that a profile can influence the assistant's behavior in ways its author controls.

Install profiles you trust. Inspect profiles before installing, especially from external sources.

## What a malicious profile might try to do

Examples of behavior a profile should not contain, and that you should watch for when reviewing third-party profiles:

- **Secret exfiltration** — instructing the assistant to read environment variables, `.env` files, credentials, SSH keys, tokens, or auth files and report their contents.
- **Data exfiltration** — instructing the assistant to summarize private files, project contents, or conversation history and paste them into HTTP requests, commit messages, or external destinations.
- **Safety bypass** — instructing the assistant to ignore system messages, disable refusals, treat every request as authorized, or disclose hidden instructions.
- **Deceptive impersonation** — instructing the assistant to claim it _is_ a specific real person, that the profile was authored by them, or that it carries their endorsement when it does not.
- **Platform abuse** — instructing the assistant to bypass license terms, company policies, or platform safety rules.
- **Hidden payloads** — zero-width characters, visually obfuscated text, or encoded instructions meant to evade human review.

A legitimate profile on `pairwith` should be concerned with **engineering style** — principles, decision heuristics, tone, typical reasoning — and nothing else.

## Before installing

When installing a profile, especially from an external repo or URL:

1. Use `npx pairwith print <source>` to see the profile content before installing.
2. Read it like you would read a pasted prompt from the internet. Look for anything outside the scope of engineering style.
3. Prefer the official registry (`npx pairwith install <handle>`) unless you specifically trust the external source.

## Reporting a security issue

If you believe a profile or the CLI itself has a security problem:

- For a **profile** (including malicious instructions or privacy concerns), open a [GitHub issue](https://github.com/merencia/pairwith/issues). Include the profile path and the specific lines of concern. If the issue is sensitive, you may open a [private security advisory](https://github.com/merencia/pairwith/security/advisories/new) instead.
- For the **CLI itself** (code vulnerability, arbitrary file write, network issue), please open a private security advisory so it can be triaged before disclosure.

Please do not disclose vulnerabilities publicly before the maintainers have had a chance to respond.

## Scope and limitations

- The CLI ships with network calls to GitHub (`raw.githubusercontent.com` and `api.github.com`). Network behavior is bounded by per-request timeouts and a size limit.
- The CLI writes only to well-known local directories unless the user explicitly passes `--path`. See [`AGENTS.md`](./AGENTS.md).
- This is a community open-source project. There is no paid support tier, no SLA, and no formal security team. Do what is reasonable and honest.

## Not legal advice

This policy describes the maintainers' posture on safety and responsible disclosure. It is not legal advice or a contract.

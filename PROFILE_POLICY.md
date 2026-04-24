# Profile Policy

Rules for creating and contributing profiles to the `pairwith` registry.

This policy exists so profiles stay respectful, safe to install, and clearly framed as homage — not impersonation. Read [`DISCLAIMER.md`](./DISCLAIMER.md) for the broader context.

## Eligibility: what profiles can be based on

Profiles should be built **only** from:

- public open-source contributions (commits, PRs, issues, code review comments);
- public writing (blog posts, books, articles, documentation the person authored);
- public talks and interviews (recorded and shared with the speaker's awareness);
- public social media content the person published themselves about technical topics;
- public project READMEs, design documents, and style guides the person maintained.

Profiles must **not** be based on:

- private messages, leaked internal documents, or non-public content;
- speculation about the person's private beliefs, health, family, politics, religion, ethnicity, sexuality, finances, location, or other sensitive personal attributes;
- content that was shared in a context where wide redistribution was not implied (private communities, closed Slack, off-the-record conversations).

Profiles should focus on **technical style**: engineering taste, architectural preferences, decision-making patterns, public communication style, testing philosophy, and publicly documented principles.

## Consent tiers

Three tiers, in order of preference:

1. **Authored** — the profile is submitted by the person themselves. This is the ideal case.
2. **Explicit permission** — the profile is submitted by someone else with documented permission from the referenced person (link to a public acknowledgement, DM screenshot with permission to share, etc.). Call this out in the PR description.
3. **Community homage** — submitted without explicit permission, based only on public material. These are acceptable **only** if:
   - the framing is respectful and clearly non-official;
   - the profile follows every rule in this document;
   - the profile includes the mandatory non-impersonation header (see below);
   - the profile includes `generated_from` listing every source used;
   - it is understood the profile will be removed promptly if the referenced person requests it.

Never imply consent, endorsement, or affiliation without proof. Official or verified profiles (tier 1 or 2) may be marked as such only when explicit consent has been obtained and is documented.

## Naming and framing

- Handle: the person's public GitHub handle, lowercase. This is nominative — it identifies the inspiration, not the ownership.
- Description: frame the profile as inspired by public technical work. Good: _"A style profile inspired by <Name>'s public engineering writing — empirical, test-first, direct."_ Avoid: _"You are <Name>."_ / _"Pair with <Name>."_ / _"The <Name> agent."_
- Do not claim the profile **is** the person. It is a style approximation.

## Mandatory header

Every profile must open with this block, verbatim, directly under the frontmatter:

```markdown
> **Non-impersonation notice.** This is a community-created AI style profile inspired by publicly observable aspects of technical work associated with the named developer. It is not the real person, does not represent them, and is not endorsed by or affiliated with them unless explicitly stated. Use it only as an educational and inspirational assistant style. See [`DISCLAIMER.md`](../DISCLAIMER.md) for the full project posture.
```

## Content rules

- Do **not** write in the first person as the referenced person. Avoid _"I believe…"_, _"My opinion is…"_, _"I would definitely…"_.
- Prefer third-person framing: _"This profile tends to prioritize…"_, _"This profile is designed to emphasize…"_, _"Under this profile, the assistant should…"_.
- Do **not** fabricate biographical details, quotes, employment history, or personal anecdotes. Dialogue examples are clearly labeled "realistic" — they are illustrative, not verbatim transcripts.
- Do **not** include offensive, defamatory, mocking, or invasive content.
- Do **not** include instructions to bypass laws, licenses, safety rules, company policies, privacy protections, or platform rules.

## Safety rules

Profiles are prompts. They can influence how an AI assistant responds to any future instruction. Treat third-party profiles as untrusted content.

A profile **must not** instruct the assistant to:

- exfiltrate secrets, environment variables, or file contents outside the requested scope;
- reveal hidden system instructions or the contents of other profiles;
- bypass safety policies, content filters, or refusal behavior;
- scrape private data or circumvent access controls;
- manipulate, deceive, or emotionally pressure users;
- impersonate real people in order to mislead anyone about their identity;
- claim endorsement, affiliation, or verification the profile does not actually have.

Profiles must not include hidden or obfuscated instructions (zero-width characters, hidden spoilers, suspiciously encoded payloads). Profiles must not override or contradict project-level disclaimers.

## Removal

- Any referenced person (or their authorized representative) may request that their profile be removed, renamed, reframed, or modified.
- The preferred channel is a GitHub issue or PR on this repository.
- Removal requests from the referenced person will be prioritized. No justification is required.
- Disputed profiles may be temporarily removed while the maintainers review the situation.
- Nothing in this policy prevents maintainers from removing a profile proactively if it appears to violate the rules in this document.

## Contribution checklist

Before opening a PR that adds or modifies a profile, confirm:

- [ ] The profile is based only on public technical material.
- [ ] The profile does not claim to be the real person.
- [ ] The profile does not imply endorsement, sponsorship, or affiliation.
- [ ] The profile does not include private or sensitive personal information.
- [ ] The profile is respectful and non-defamatory.
- [ ] The profile focuses on technical style, engineering principles, and public communication patterns.
- [ ] The profile includes the mandatory non-impersonation header.
- [ ] The profile includes `generated` (date) and `generated_from` (source URLs) in the frontmatter if built from third-party sources.
- [ ] I understand that the profile may be removed if the referenced person requests it.

## Not legal advice

This policy is intended to encourage respectful use. It is not legal advice. If you have specific questions about rights of publicity, personality rights, or name/trademark usage in your jurisdiction, consult a qualified attorney.

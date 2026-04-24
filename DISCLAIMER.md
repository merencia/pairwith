# Disclaimer

`pairwith` is a community, open-source project. The profiles distributed through it are respectful, fictionalized AI style profiles inspired by public technical material from developers and technical leaders we admire. They are intended for education, inspiration, and developer workflow experimentation.

This document is a plain-language summary of how the project positions itself. It is not legal advice.

## No affiliation and no endorsement

Unless a profile explicitly states otherwise, a profile on `pairwith`:

- is **not** the real person it references;
- is **not** approved, reviewed, sponsored, or endorsed by that person;
- is **not** affiliated with the person's employer or any organization they are part of;
- does **not** speak on behalf of the person.

The person's name is used nominatively — that is, solely to identify the inspiration source for the homage profile.

## No impersonation

A profile is a set of prompt instructions that shapes how an AI assistant communicates, reasons, and makes trade-offs. It is not a faithful reproduction of a person's opinions, behavior, or expertise. Using `pairwith` to deceive others into believing they are interacting with the real person is outside the intended use of this project and is not supported.

## No claim of accuracy

Profiles are approximations derived from publicly available material: open-source contributions, public writing, public talks, interviews, documentation, and similar sources. They reflect interpretation and simplification. Do not quote a profile as if it were a direct statement, opinion, or recommendation of the real person.

## No private data

Profiles should not include private information, leaked content, personal details not voluntarily shared in a public context, or sensitive personal attributes (political, religious, medical, financial, family, location, ethnicity, sexuality). If a profile contains any of this, it will be treated as a bug and removed.

## Profiles are text, not code

Profiles are Markdown prompts. The `pairwith` CLI writes these files to local directories used by AI tools (such as `~/.claude/agents/`); it does not execute profile content. However, an AI assistant that reads a profile will follow the instructions inside it. Treat any profile you did not author as untrusted content — the same way you would treat a pasted prompt from the internet. Inspect before installing.

## Removal on request

If you are referenced by a profile and would prefer that it be removed, renamed, reframed, or changed, please [open an issue](https://github.com/merencia/pairwith/issues) or send a PR. Removal requests from the referenced person, or their authorized representative, will be prioritized and handled respectfully and promptly. Disputed profiles may be temporarily removed while reviewed. No justification is required.

## User responsibility

Users of `pairwith` are responsible for how they use profiles they install. Do not use this project to deceive, harass, defame, impersonate, or misrepresent anyone. Maintainers cannot be responsible for misuse of profiles by third parties.

## Legal note

This project is maintained as an open-source community tool. These policies are intended to encourage respectful use; they are not a substitute for legal advice. If you are building on top of `pairwith`, distributing it commercially, or have a specific legal question, consult a qualified attorney.

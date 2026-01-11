---
id: 0013
title: Cosmos keys how to
stage: general
date: 2026-01-07
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: main
user: user
command: N/A
labels: [cosmos, portal, how-to]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - none
tests:
 - none
---

## Prompt

how i will get endpoint or key likewhere

## Response snapshot

Explained where to find Cosmos DB endpoint and keys in Azure Portal: Overview page shows URI; Keys blade provides primary/secondary keys and full connection strings. Advised to copy Primary Connection String for local.settings.json and share endpoint/key/database/container/partition details for configuration.

## Outcome

- ✅ Impact: User guided to retrieve Cosmos connection info.
- 🧪 Tests: Not run.
- 📁 Files: None.
- 🔁 Next prompts: Provide primary connection string, database/container names, partition key.
- 🧠 Reflection: Keep secrets local; use connection string in local.settings.json.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): Insert connection string and run local stack.

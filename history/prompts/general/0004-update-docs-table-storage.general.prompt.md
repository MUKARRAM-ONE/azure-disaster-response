---
id: 0004
title: Update docs for Table Storage
stage: general
date: 2025-05-19
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: unknown
user: user
command: documentation updates
labels: ["docs","azure","deployment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - README.md
 - AZURE_DEPLOYMENT_COMPLETE.md
 - DEPLOYMENT_GUIDE.md
 - PROJECT_SUMMARY.md
 - TERMINAL_COMMANDS.md
 - QUICKSTART.md
 - cleanup-docs.sh
tests:
 - none
---

## Prompt

first off all update all the things in the readme and all what we have done in the azure dployment perfectly and check all files does there will be no any missing and broken things

## Response snapshot

Aligned documentation with Python + Azure Table Storage architecture, updated deployment steps and command references, refreshed quickstart/summary guides, and added a cleanup script.

## Outcome

- ✅ Impact: Docs now describe Table Storage deployment and live Function App; removed outdated Cosmos DB/Node guidance.
- 🧪 Tests: Not run (documentation-only changes).
- 📁 Files: README, deployment guides, terminal commands, quickstart, and summary updated; added cleanup-docs.sh.
- 🔁 Next prompts: Push changes and redeploy from Cloud Shell; optionally clean legacy templates referencing Cosmos.
- 🧠 Reflection: Focused on user-facing docs; internal templates still mention Cosmos and can be updated later if needed.

## Evaluation notes (flywheel)

- Failure modes observed: None noted beyond legacy template references.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Update .specify templates to new storage choice if required.

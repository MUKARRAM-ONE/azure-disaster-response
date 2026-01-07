---
id: 0006
title: Fix frontend function URL
stage: general
date: 2026-01-07
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: copilot/build-disaster-response-platform
user: user
command: nl -ba index.html | sed -n '165,215p'
labels: [frontend,bugfix]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - index.html
tests:
 - not run (not requested)
---

## Prompt

Network error: Failed to fetch. Make sure the Azure Function is running.

when i click on sbmit it will show mw like this

## Response snapshot

Pointed the frontend to the deployed Function App URL and corrected the storage description to Azure Table Storage.

## Outcome

- ✅ Impact: Frontend now targets the live SubmitAlert endpoint instead of localhost.
- 🧪 Tests: Not run (UI text/endpoint change only).
- 📁 Files: Updated index.html configuration and copy.
- 🔁 Next prompts: Re-upload index.html to the $web container to publish the change.
- 🧠 Reflection: Keep prod URL in config to avoid fetch errors on hosted site.

## Evaluation notes (flywheel)

- Failure modes observed: Fetch errors when local URL left in prod.
- Graders run and results (PASS/FAIL): None
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Add health-check ping before enabling submit.

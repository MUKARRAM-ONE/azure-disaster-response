---
id: 0012
title: Create local env files
stage: general
date: 2026-01-07
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: main
user: user
command: N/A
labels: [env,auth0,cosmos,local-testing]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/.env.local
 - local.settings.json
tests:
 - none
---

## Prompt

cretae a .env environment and put all the details there

## Response snapshot

Created frontend/.env.local with provided Auth0 domain and client ID plus defaults for audience, redirect, and API URL; added COSMOS_CONNECTION_STRING placeholder to local.settings.json. Noted that Cosmos connection string is still needed locally and Auth0 client secret is not placed in frontend envs.

## Outcome

- ✅ Impact: Local env files prepared; awaiting Cosmos connection string and backend secret handling as needed.
- 🧪 Tests: Not run.
- 📁 Files: frontend/.env.local, local.settings.json updated.
- 🔁 Next prompts: Provide Cosmos connection string; confirm audience and backend secret handling; run setup-local.sh.
- 🧠 Reflection: Kept client secret out of frontend env; placeholders remain for Cosmos.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): Insert Cosmos connection string and run local stack.

---
id: 0011
title: Collect local test creds
stage: general
date: 2026-01-07
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: main
user: user
command: N/A
labels: [local-testing, auth0]
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

name : azure-disaster-app
domain : dev-cd8d8uv2m3sbhme1.us.auth0.com
client id: TFK4c5MCtxt6xCYqRoNh3fiPL2QbaiMS
Client secret :
ATiqWSjbdY57BAa8gxzAAQ8HpVCCS4-fIhMFLmW6RPj1IX2Yvij8zujfqImIJWDc

## Response snapshot

Requested remaining Auth0 audience and Cosmos connection details; advised to keep secrets local and use placeholders if needed.

## Outcome

- ✅ Impact: Guidance provided; awaiting missing values to run local test.
- 🧪 Tests: Not run (guidance only).
- 📁 Files: None.
- 🔁 Next prompts: Provide audience and Cosmos details; confirm API base URL/partition key.
- 🧠 Reflection: Avoid storing secrets in repo; prefer local env files.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): Fill env placeholders and execute local stack.

---
id: 0002
title: Cosmos region policy block
stage: general
date: 2026-01-06
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: copilot/build-disaster-response-platform
user: user
command: none
labels: ["azure","deployment","cosmos"]
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

Type "az" to use Azure CLI
Type "help" to learn about Cloud Shell

Your Cloud Shell session will be ephemeral so no files or system changes will persist beyond your current session.
mukarram [ ~ ]$ az cosmosdb create \
  --name cosmos-disaster-$(date +%s) \
  --resource-group disaster-response-rg \
  --locations regionName=eastus \
  --enable-free-tier true \
  --default-consistency-level Session
Argument '--enable-free-tier' is in preview and under development. Reference and support levels: https://aka.ms/CLI_refstatus
(RequestDisallowedByAzure) Resource 'cosmos-disaster-1767723674' was disallowed by Azure: This policy maintains a set of best available regions where your subscription can deploy resources. The objective of this policy is to ensure that your subscription has full access to Azure services with optimal performance. Should you need additional or different regions, contact support..
Code: RequestDisallowedByAzure
Message: Resource 'cosmos-disaster-1767723674' was disallowed by Azure: This policy maintains a set of best available regions where your subscription can deploy resources. The objective of this policy is to ensure that your subscription has full access to Azure services with optimal performance. Should you need additional or different regions, contact support..
Target: cosmos-disaster-1767723674
mukarram [ ~ ]$ 

## Response snapshot

Explained region policy block, suggested listing allowed locations and re-running cosmos create with an allowed region; offered command snippets to check policy assignments and deploy with permitted location.

## Outcome

- ✅ Impact: Provided recovery steps for policy-blocked Cosmos creation.
- 🧪 Tests: No tests run.
- 📁 Files: No files changed.
- 🔁 Next prompts: Share allowed regions output and rerun create with permitted location.
- 🧠 Reflection: Need allowed-location info to proceed.

## Evaluation notes (flywheel)

- Failure modes observed: Azure policy denied region.
- Graders run and results (PASS/FAIL): None.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Try Cosmos creation in an allowed region from policy list.

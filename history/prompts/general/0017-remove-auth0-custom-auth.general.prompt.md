---
id: 0017
title: Remove Auth0 add custom auth
stage: general
date: 2026-01-10
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: main
user: user
command: N/A
labels: [auth, cosmos, frontend]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - auth_utils.py
 - AuthRegister/__init__.py
 - AuthRegister/function.json
 - AuthLogin/__init__.py
 - AuthLogin/function.json
 - AuthMe/__init__.py
 - AuthMe/function.json
 - GetAlerts/index.py
 - GetAlert/index.py
 - SubmitAlert/__init__.py
 - requirements.txt
 - local.settings.json
 - frontend/package.json
 - frontend/src/auth/AuthContext.jsx
 - frontend/src/main.jsx
 - frontend/src/App.jsx
 - frontend/src/components/Navbar.jsx
 - frontend/src/components/SubmitAlertForm.jsx
 - frontend/src/components/AlertsDashboard.jsx
 - frontend/src/components/LoginPage.jsx
files:
 - auth_utils.py
 - AuthRegister/__init__.py
 - AuthRegister/function.json
 - AuthLogin/__init__.py
 - AuthLogin/function.json
 - AuthMe/__init__.py
 - AuthMe/function.json
 - GetAlerts/index.py
 - GetAlert/index.py
 - SubmitAlert/__init__.py
 - requirements.txt
 - local.settings.json
 - frontend/package.json
 - frontend/src/auth/AuthContext.jsx
 - frontend/src/main.jsx
 - frontend/src/App.jsx
 - frontend/src/components/Navbar.jsx
 - frontend/src/components/SubmitAlertForm.jsx
 - frontend/src/components/AlertsDashboard.jsx
 - frontend/src/components/LoginPage.jsx
tests:
 - none
---

## Prompt

remove auth zero directly it with the cosmos db with complete web application like sign in sign up form and also continue with google etc

## Response snapshot

Replaced Auth0 with a custom JWT auth flow backed by Cosmos: added register/login/me functions issuing JWTs with bcrypt-hashed passwords, updated API handlers to verify tokens, and added frontend auth context with email/password forms. Social buttons remain placeholders pending provider setup. Updated local settings, requirements, and removed Auth0 dependency.

## Outcome

- ✅ Impact: Custom auth stack enabled; frontend and backend aligned on JWT; Auth0 removed.
- 🧪 Tests: Not run (manual login/submit flow pending).
- 📁 Files: Backend auth functions added; existing functions updated; frontend auth rewritten; deps updated.
- 🔁 Next prompts: Provide OAuth client IDs to enable Google/GitHub/Facebook; run local flow and verify alert submission.
- 🧠 Reflection: Social login requires provider verification; keep JWT secret safe in env only.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): Test register/login and alert submission locally.

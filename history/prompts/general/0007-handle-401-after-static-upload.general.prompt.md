---
id: 0007
title: Handle 401 after static upload
stage: general
date: 2026-01-07
surface: agent
model: GPT-5.1-Codex-Max
feature: none
branch: copilot/build-disaster-response-platform
user: user
command: none
labels: [deployment,troubleshooting]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - none
tests:
 - not run (not requested)
---

## Prompt

"nextMarker": {}
}
mukarram [ ~/azure-disaster-response ]$ STORAGE_ACCOUNT=stgdisaster767816886
az storage blob service-properties update --account-name $STORAGE_ACCOUNT --static-website --index-document index.html
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name '$web' --file index.html --name index.html --overwrite
{
  "cors": [],
  "deleteRetentionPolicy": {
    "allowPermanentDelete": null,
    "days": null,
    "enabled": false
  },
  "hourMetrics": {
    "enabled": false,
    "includeApis": null,
    "retentionPolicy": {
      "allowPermanentDelete": null,
      "days": null,
      "enabled": false
    },
    "version": "1.0"
  },
  "logging": {
    "delete": false,
    "read": false,
    "retentionPolicy": {
      "allowPermanentDelete": null,
      "days": null,
      "enabled": false
    },
    "version": "1.0",
    "write": false
  },
  "minuteMetrics": {
    "enabled": false,
    "includeApis": null,
    "retentionPolicy": {
      "allowPermanentDelete": null,
      "days": null,
      "enabled": false
    },
    "version": "1.0"
  },
  "staticWebsite": {
    "defaultIndexDocumentPath": null,
    "enabled": true,
    "errorDocument_404Path": null,
    "indexDocument": "index.html"
  },
  "target_version": null
}
Finished[#############################################################]  100.0000%
{
  "client_request_id": "be48e378-ec0e-11f0-98ac-00155d4587df",
  "content_md5": "sMWrQIVJT/96/djrgyyYDQ==",
  "date": "2026-01-07T21:20:51+00:00",
  "encryption_key_sha256": null,
  "encryption_scope": null,
  "etag": "\"0x8DE4E32A2B789C6\"",
  "lastModified": "2026-01-07T21:20:51+00:00",
  "request_id": "9a35b00c-301e-0042-4b1b-809ce0000000",
  "request_server_encrypted": true,
  "version": "2022-11-02",
  "version_id": null
}
mukarram [ ~/azure-disaster-response ]$ az storage account show --name $STORAGE_ACCOUNT --query "primaryEndpoints.web" -o tsv
https://stgdisaster767816886.z7.web.core.windows.net/
mukarram [ ~/azure-disaster-response ]$ Status:  401
Headers:  Headers {
  'transfer-encoding': 'chunked',
  via: '1.1 ccon-prod-centralindia-aci-02.servicebus.windows.net',
  'content-type': 'application/json',
  server: 'Microsoft-HTTPAPI/2.0',
  'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  'access-control-expose-headers': 'Content-Length',
  'strict-transport-security': 'max-age=31536000',
  'www-authenticate': 'In Strategy.prototype.jwtVerify: cannot verify token',
  date: 'Wed, 07 Jan 2026 21:26:38 GMT'
}
Body:  Unauthorized
Failed to resize terminal.
Status:  401
Headers:  Headers {
  'transfer-encoding': 'chunked',
  via: '1.1 ccon-prod-centralindia-aci-02.servicebus.windows.net',
  'content-type': 'application/json',
  server: 'Microsoft-HTTPAPI/2.0',
  'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  'access-control-expose-headers': 'Content-Length',
  'strict-transport-security': 'max-age=31536000',
  'www-authenticate': 'In Strategy.prototype.jwtVerify: cannot verify token',
  date: 'Wed, 07 Jan 2026 21:27:42 GMT'
}
Body:  Unauthorized
Failed to resize terminal.
^C
mukarram [ ~/azure-disaster-response ]$ az storage blob upload --account-name stgdisaster767816886 --container-name '$web' --file [index.html](http://_vscodecontentref_/2) --name [index.html](http://_vscodecontentref_/3) --overwrite
bash: syntax error near unexpected token `('
mukarram [ ~/azure-disaster-response ]$ az storage blob upload --account-name stgdisaster767816886 --container-name '$web' --file [index.html](http://_vscodecontentref_/2) --name [index.html](http://_vscodecontentref_/3) --overwrite
bash: syntax error near unexpected token `('
mukarram [ ~/azure-disaster-response ]$ 

## Response snapshot

Explained the correct upload command (no VS Code link markup) and outlined 401 troubleshooting: hit the deployed SubmitAlert endpoint directly with curl, and if it still returns 401, check whether the Function auth level changed to `function` and append the host/function key to the URL.

## Outcome

- ✅ Impact: Clarified how to re-upload index.html and verify the Function endpoint without markdown link artifacts.
- 🧪 Tests: Not run (advice only).
- 📁 Files: None changed.
- 🔁 Next prompts: Provide resource group/subscription to fetch function key if 401 persists.
- 🧠 Reflection: Avoid markdown link syntax in shell commands; confirm backend auth level when seeing 401.

## Evaluation notes (flywheel)

- Failure modes observed: Shell command failed due to pasted markdown links; 401 from backend likely due to auth configuration.
- Graders run and results (PASS/FAIL): None
- Prompt variant (if applicable): None
- Next experiment: Use `curl` with sample payload to confirm 201 from the Function URL.

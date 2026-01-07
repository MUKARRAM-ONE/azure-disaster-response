---
id: 0003
title: Cosmos region retry guidance
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

mukarram [ ~ ]$ az provider show -n Microsoft.DocumentDB --query "resourceTypes[?resourceType=='databaseAccounts'].locations" -o tsv
West Central US North Central US        Central US      Brazil South    Canada Central   West US 2       East US 2       France Central  Japan East      Southeast Asia   Central India   South Africa North      Switzerland North       UAE NorthUK West North Europe    West Europe     Norway East     Korea Central   Australia East   Canada East     East Asia       Germany West Central    UK South        Australia Central        Australia Southeast     Japan West      Korea South     South India      West India      West US South Central US        East US West US 3Sweden Central  Qatar Central   Poland Central  Italy North     Israel Central  Spain Central    New Zealand North       Mexico Central  Indonesia Central       Chile Central    Malaysia West   Austria East    Belgium Central
mukarram [ ~ ]$ az account list-locations --query "[].name" -o tsv
eastus
westus2
australiaeast
southeastasia
northeurope
swedencentral
westeurope
uksouth
centralus
southafricanorth
centralindia
eastasia
indonesiacentral
japaneast
japanwest
koreacentral
malaysiawest
newzealandnorth
canadacentral
austriaeast
belgiumcentral
francecentral
germanywestcentral
italynorth
orwayeast
polandcentral
spaincentral
switzerlandnorth
mexicocentral
uaenorth
brazilsouth
chilecentral
eastus2euap
israelcentral
qatarcentral
centralusstage
eastusstage
eastus2stage
northcentralusstage
southcentralusstage
westusstage
westus2stage
asia
asiapacific
australia
brazil
canada
europe
france
germany
global
india
indonesia
israel
italy
japan
korea
malaysia
mexico
newzealand
norway
poland
qatar
singapore
southafrica
spain
sweden
switzerland
taiwan
uae
uk
unitedstates
unitedstateseuap
eastasiastage
southeastasiastage
eastus2
eastusstg
southcentralus
westus3
northcentralus
westus
jioindiawest
centraluseuap
southcentralusstg
westcentralus
southafricawest
australiacentral
australiacentral2
australiasoutheast
jioindiacentral
koreasouth
southindia
westindia
canadaeast
francesouth
germanynorth
norwaywest
switzerlandwest
uaecentral
brazilsoutheast
ukwest
mukarram [ ~ ]$ 


mukarram [ ~ ]$ REGION=<allowed-region-from-output>
COSMOS_NAME=cosmos-disaster-$(date +%s)

az cosmosdb create \
  --name $COSMOS_NAME \
  --resource-group disaster-response-rg \
  --locations regionName=$REGION \
  --enable-free-tier true \
  --default-consistency-level Session
bash: syntax error near unexpected token `newline'
Argument '--enable-free-tier' is in preview and under development. Reference and support levels: https://aka.ms/CLI_refstatus
(RequestDisallowedByAzure) Resource 'cosmos-disaster-1767724081' was disallowed by Azure: This policy maintains a set of best available regions where your subscription can deploy resources. The objective of this policy is to ensure that your subscription has full access to Azure services with optimal performance. Should you need additional or different regions, contact support..
Code: RequestDisallowedByAzure
Message: Resource 'cosmos-disaster-1767724081' was disallowed by Azure: This policy maintains a set of best available regions where your subscription can deploy resources. The objective of this policy is to ensure that your subscription has full access to Azure services with optimal performance. Should you need additional or different regions, contact support..
Target: cosmos-disaster-1767724081
mukarram [ ~ ]$ 

## Response snapshot

Identified placeholder/newline issue and region policy block; provided a one-liner with a concrete allowed region (centralus) and next steps to create DB/container and fetch keys.

## Outcome

- ✅ Impact: Clear retry command with allowed region guidance.
- 🧪 Tests: No tests run.
- 📁 Files: No files changed.
- 🔁 Next prompts: Share creation output (endpoint/key) or policy errors.
- 🧠 Reflection: Need confirmation of allowed region success.

## Evaluation notes (flywheel)

- Failure modes observed: Region policy denial; bad variable substitution due to placeholder/newline.
- Graders run and results (PASS/FAIL): None.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Use centralus and remove placeholder/newline mistakes.

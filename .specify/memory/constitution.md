<!--
SYNC IMPACT REPORT - Constitution v1.0.0 Initial Ratification
==============================================================
VERSION CHANGE: None (Initial) → 1.0.0
RATIONALE: Initial constitution ratification for Project #40 - Disaster Response Platform

PRINCIPLES ESTABLISHED (7 Total):
  ✅ I. Serverless-First Architecture
  ✅ II. Cloud-Native Data
  ✅ III. Modern Web Standards
  ✅ IV. Infrastructure as Code
  ✅ V. Student-Friendly
  ✅ VI. Security-Conscious
  ✅ VII. Local Development First

SECTIONS ADDED:
  ✅ Core Principles (7 principles)
  ✅ Project Context (student project constraints, Azure Student Pack)
  ✅ Technology Stack (mandatory stack definitions)
  ✅ Development Workflow (local-first, IaC deployment)
  ✅ Governance (amendment procedure, versioning policy)

TEMPLATES REQUIRING UPDATES:
  ✅ .specify/templates/plan-template.md (Constitution Check section)
  ✅ .specify/templates/spec-template.md (requirements alignment)
  ✅ .specify/templates/tasks-template.md (task categorization)

FOLLOW-UP TODOS: None - all placeholders resolved

Generated: 2025-01-06
-->

# Disaster Response Platform Constitution

**Project #40** | Student project using Azure Student Pack

## Core Principles

### I. Serverless-First Architecture

All backend functionality MUST be implemented using Azure Functions (Python programming model). This principle ensures:

- **Cost Efficiency**: Consumption-based pricing stays within Azure Student Pack limits ($100/year credit)
- **Automatic Scaling**: No manual infrastructure management required
- **Simplified Deployment**: Single function app deployment model
- **Educational Value**: Exposure to modern cloud-native serverless patterns

**Rationale**: Serverless architecture minimizes operational overhead for student projects while providing real-world cloud development experience. Azure Functions consumption plan typically costs $0 for development workloads under free tier limits.

### II. Cloud-Native Data

Cosmos DB MUST be the primary data store for all persistent data. This principle mandates:

- **NoSQL Document Model**: JSON document storage aligned with Python dictionaries
- **Serverless Capacity Mode**: Pay-per-request pricing within student budget
- **Partition Key Design**: Efficient data distribution (`/alertType` or `/location`)
- **No Local Database**: Development uses Cosmos DB Emulator or live instance

**Rationale**: Cosmos DB serverless mode charges only for operations performed (~$0.25/million reads, $1.25/million writes), making it ideal for student projects with low traffic. Globally distributed capabilities demonstrate enterprise-grade data patterns.

### III. Modern Web Standards

Frontend MUST use established, zero-dependency modern web technologies:

- **Bootstrap 5**: Responsive UI framework (CDN-hosted, no build step required)
- **Vanilla JavaScript**: No frontend frameworks (React/Vue/Angular) to minimize complexity
- **Fetch API**: Native browser HTTP client for API calls
- **Semantic HTML5**: Accessible markup with proper form validation
- **CSS Grid/Flexbox**: Modern layout techniques via Bootstrap utilities

**Rationale**: Reduces cognitive load for students new to web development. Zero build step enables immediate browser testing. Bootstrap provides professional UI without custom CSS expertise.

### IV. Infrastructure as Code

All Azure resources MUST be defined in Bicep templates with no manual portal configuration (except initial resource group). This principle requires:

- **Single Bicep File**: `main.bicep` defines all resources (Function App, Cosmos DB, Storage Account, App Service Plan)
- **Parameterization**: Resource names, locations, SKUs defined as parameters
- **Idempotent Deployment**: `az deployment group create` can be run repeatedly
- **Version Control**: Bicep templates committed to repository
- **No Manual Steps**: Documentation must use CLI/Bicep only (no "click here in portal")

**Rationale**: Infrastructure as Code ensures reproducibility across student accounts, enables automated deployment in GitHub Codespaces, and teaches DevOps best practices. Bicep's declarative syntax is easier for students than ARM JSON.

### V. Student-Friendly

All technical decisions MUST prioritize learning and minimize barriers to entry:

- **Free Tier Compliance**: All services stay within Azure Student Pack free tier limits
- **Clear Documentation**: Step-by-step guides with expected outputs (`QUICKSTART.md`, `README.md`)
- **Minimal Tooling**: Only essential tools (Azure CLI, Functions Core Tools, Python/Node.js)
- **Low Complexity**: Avoid abstractions, design patterns, or architectures not justified by requirements
- **Fast Feedback**: Local development with `func start` provides <5 second iteration cycles
- **Troubleshooting Guides**: Common errors documented with solutions

**Rationale**: Student projects must balance educational value with achievable scope. Overwhelming students with enterprise patterns (repositories, dependency injection, microservices) defeats the purpose of hands-on learning.

### VI. Security-Conscious

Security MUST be implemented through configuration and platform features, not custom code:

- **Environment Variables**: All secrets (`COSMOS_CONNECTION_STRING`) in `local.settings.json` (local) and App Settings (Azure)
- **CORS Configuration**: Explicit allowed origins in `host.json` or Function App settings
- **Input Validation**: Required fields validated server-side before database writes
- **HTTPS Only**: Azure Functions default to HTTPS; HTTP redirects enforced
- **No Hardcoded Secrets**: `.gitignore` excludes `local.settings.json`, template file provided
- **Managed Identity (Future)**: Cosmos DB access via Managed Identity instead of connection strings (aspirational)

**Rationale**: Students often lack security training. Enforcing platform-level security (environment variables, CORS, HTTPS) prevents common vulnerabilities without requiring deep security expertise.

### VII. Local Development First

All features MUST be testable locally before Azure deployment:

- **Cosmos DB Emulator**: Windows/Linux emulator for local Cosmos DB (or live dev instance)
- **Azure Functions Core Tools**: `func start` runs functions locally on port 7071
- **Browser Testing**: `index.html` opened directly in browser (no web server required initially)
- **Fast Iteration**: Code changes reflected with function restart (<5 seconds)
- **No Azure Required**: Students can develop entire feature before first deployment
- **Deployment as Final Step**: Azure deployment only after local validation

**Rationale**: Local development removes dependency on internet connectivity, Azure credits, and deployment wait times. Students iterate faster and learn debugging without cloud deployment complexities.

## Project Context

### Student Project Constraints

- **Budget**: Azure Student Pack provides $100/year credit (must not exceed)
- **Timeline**: Typical project duration 2-4 weeks (academic semester)
- **Skill Level**: Assumes basic HTML/JavaScript knowledge, no prior Azure experience
- **Development Environment**: GitHub Codespaces with pre-installed Azure CLI and Functions Core Tools
- **Team Size**: Individual or 2-3 student teams
- **Support**: Limited instructor/TA availability (clear documentation critical)

### Success Criteria

The project demonstrates success when a student can:

1. Deploy infrastructure with single `az deployment group create` command
2. Submit an alert from the web UI and see it stored in Cosmos DB
3. Explain the serverless request flow (browser → Function → Cosmos DB)
4. Estimate monthly Azure costs based on usage patterns
5. Reproduce the deployment in a new Azure subscription

## Technology Stack

### Mandatory Technologies

The following technologies are **non-negotiable** and required for all features:

- **Backend Runtime**: Python 3.11+ (Azure Functions v4 support)
- **Backend Language**: Python, NOT TypeScript or complex frameworks
- **Function Model**: Azure Functions v4 programming model (HTTP triggers, Cosmos DB output bindings)
- **Database**: Azure Cosmos DB for NoSQL (serverless capacity mode)
- **Frontend Framework**: Bootstrap 5 (CDN-hosted via jsDelivr or unpkg)
- **Frontend Language**: Vanilla JavaScript ES6+ (no transpilation, no frameworks)
- **IaC Language**: Bicep (not ARM JSON, not Terraform)
- **Deployment Method**: Azure CLI (`az deployment group create`, `func azure functionapp publish`)
- **Version Control**: Git + GitHub (project initialized from template repository)

### Prohibited Technologies

To maintain student-friendly simplicity and free tier compliance, the following are **prohibited**:

- ❌ TypeScript (adds build step complexity)
- ❌ Frontend frameworks (React, Vue, Angular) unless explicitly justified for learning objectives
- ❌ Bundlers (Webpack, Vite, Parcel) - no build step required for frontend
- ❌ Premium Azure services (Logic Apps Standard, API Management, Application Gateway)
- ❌ SQL databases (Azure SQL, PostgreSQL) - use Cosmos DB
- ❌ Container orchestration (AKS, Container Apps) - use Functions
- ❌ Third-party services requiring separate sign-up (Auth0, SendGrid, Twilio)
- ❌ Complex Python frameworks (Django, FastAPI for simple projects) - use Azure Functions bindings

### Approved Additions

The following may be added if justified by user stories and within free tier:

- ✅ Azure Storage Blobs (for file uploads, free tier: 5GB)
- ✅ Application Insights (for logging/telemetry, included with Function App)
- ✅ Azure Static Web Apps (alternative frontend hosting, free tier: 100GB bandwidth)
- ✅ Azure Key Vault (for secret management, free tier: 10,000 operations)
- ✅ Python packages (server-side only, e.g., `pydantic` for validation, `python-dateutil` for dates)

## Development Workflow

### Local Development Cycle (Mandatory)

1. **Setup**: Clone repository, run `pip install -r requirements.txt` (Python) or `npm install` (Node.js)
2. **Configure**: Copy `local.settings.json.template` to `local.settings.json`, add Cosmos DB connection string
3. **Develop**: Edit function code, test with `func start`, access at `http://localhost:7071/api/{functionName}`
4. **Validate**: Submit test data from `index.html` (update `FUNCTION_URL` to local endpoint)
5. **Commit**: Stage changes, commit with descriptive message (e.g., "Add input validation to SubmitAlert")
6. **Deploy**: Run `func azure functionapp publish <app-name>` (only after local validation)

### Azure Deployment Workflow (After Local Validation)

1. **Infrastructure**: `az deployment group create --template-file main.bicep --parameters projectName=myproject`
2. **Function Code**: `func azure functionapp publish <app-name>`
3. **Configuration**: `az functionapp config appsettings set` (if not in Bicep)
4. **Frontend**: Update `FUNCTION_URL` in `index.html` to Azure endpoint, commit
5. **Verification**: Test live endpoint, check Application Insights logs, verify Cosmos DB writes

### Testing Strategy (Encouraged, Not Mandatory)

- **Manual Testing**: Primary validation method (submit form, check database)
- **Unit Tests**: Optional (e.g., validation logic isolated from Azure SDK calls)
- **Integration Tests**: Optional (requires Cosmos DB Emulator or live instance)
- **Load Testing**: Not required for student projects (Functions auto-scale handles this)

**Rationale**: Formal automated testing adds complexity often beyond student project scope. Manual testing with clear validation steps (defined in `QUICKSTART.md`) is sufficient for learning objectives.

## Governance

### Amendment Procedure

1. **Proposal**: Document proposed change with rationale (why current principle is insufficient)
2. **Impact Analysis**: Identify affected templates, code, and documentation
3. **Version Bump**:
   - **MAJOR** (X.0.0): Removing/redefining principles, changing mandatory technology stack
   - **MINOR** (x.Y.0): Adding new principles, expanding guidance, new mandatory sections
   - **PATCH** (x.y.Z): Clarifications, typo fixes, example updates (no semantic change)
4. **Template Sync**: Update all affected templates before finalizing amendment
5. **Commit Message**: `docs: amend constitution to vX.Y.Z (summary of changes)`

### Constitution Authority

- This constitution **supersedes** all other project documentation for architectural decisions
- Feature specifications (`spec.md`) **cannot** violate constitutional principles
- Implementation plans (`plan.md`) **must** reference this constitution in "Constitution Check" section
- Pull requests **may** be rejected if they violate principles without documented justification

### Compliance Verification

All feature work must pass "Constitution Check" gates (defined in `plan-template.md`):

1. **Serverless-First**: Does design use Azure Functions for all backend logic?
2. **Cloud-Native Data**: Does design use Cosmos DB (not SQL, not files)?
3. **Modern Web Standards**: Does frontend use Bootstrap 5 + vanilla JS (no frameworks)?
4. **Infrastructure as Code**: Are new resources defined in Bicep (not manual portal steps)?
5. **Student-Friendly**: Is complexity justified? Can a student complete this in <4 hours?
6. **Security-Conscious**: Are secrets in environment variables? Is CORS configured?
7. **Local Development First**: Can feature be tested with `func start` before deployment?

**Enforcement**: Constitution violations must be documented in "Complexity Tracking" table of `plan.md` with explicit justification before proceeding.

### Versioning Policy

- **Version Format**: MAJOR.MINOR.PATCH (Semantic Versioning)
- **Ratification Date**: Original adoption date (when constitution first created) - immutable
- **Last Amended Date**: Most recent change date (updates with each amendment)
- **Version History**: Track in Git commit history (no separate CHANGELOG required for constitution)

**Version**: 1.0.0 | **Ratified**: 2025-01-06 | **Last Amended**: 2025-01-06

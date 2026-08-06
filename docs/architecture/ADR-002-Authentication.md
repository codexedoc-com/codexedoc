# ADR-002: Authentication Architecture

# Status

Accepted

# Date

2026-07-29

# Authors

Founder & COO

---

## Context

CODEXEDOC is an open-source Learning Operating System designed to help users create, organize, review, and master knowledge. As the platform transitions from a founder-led project into a community-driven open-source ecosystem, scaling technical infrastructure while maintaining strict security boundaries is critical.

Historically, CODEXEDOC relied on a dedicated, long-lived `mock` git branch to isolate local development from production authentication credentials and live databases. As documented in [ADR-001 (Branching Strategy)](./ADR-001-Branching-Strategy.md), maintaining dual long-lived branches created severe code divergence, duplicated engineering effort, and integration bottlenecks. The decision to deprecate the `mock` branch and consolidate all development on a single `main` branch is the direct predecessor to this ADR.

To eliminate branch divergence, CODEXEDOC has migrated to a single source of truth (`main` branch) and adopted a domain-driven project structure as defined in [ADR-003 (Project Structure)](./ADR-003-Project-Structure.md). However, operating entirely on a single codebase creates a new architectural challenge: how can community contributors—as defined in [ADR-004 (Contributor Workflow)](./ADR-004-Contributor-Workflow.md)—run, test, and develop the platform locally without requiring access to sensitive production identity provider API keys, OAuth secrets, or live databases?

Authentication is a foundational cross-cutting concern. If local development strictly requires third-party API keys (e.g., OAuth client secrets, email service tokens, database connection strings to production), the onboarding barrier for new contributors becomes unacceptably high. Conversely, if authentication logic is littered with ad-hoc `if/else` checks scattered across components and server actions, the codebase becomes fragile, difficult to test, and prone to security leaks.

## Problem Statement

Relying on hardcoded authentication services or requiring production credentials for local development introduces several critical engineering flaws:

- **High Onboarding Friction:** New contributors cannot run the application out-of-the-box without registering accounts for external services or requesting private maintainer credentials.
- **Security & Leak Risks:** Distributing production identity secrets or database credentials to open-source contributors invites security breaches and credential leaks.
- **Branch Drift (Legacy Issue):** Using long-lived environment branches to isolate auth configurations resulted in incompatible code paths between `mock` and `main`. This problem is resolved architecturally by [ADR-001](./ADR-001-Branching-Strategy.md), and this ADR provides the authentication mechanism that makes branch consolidation viable.
- **Domain Pollution:** Coupling domain business logic (e.g., Goals, Reviews, Knowledge) directly to specific third-party auth SDKs makes the codebase brittle and impossible to unit test in isolation. Per [ADR-003](./ADR-003-Project-Structure.md), business domains must remain self-contained and framework-agnostic.
- **Inconsistent Access Control:** Lack of an explicit authentication abstraction makes it easy for developers to bypass session checks in local environments or accidentally disable security checks in production.

## Goals

1. **Zero-Friction Onboarding:** Enable Community Contributors to clone the repository and run the full application locally in under 5 minutes without needing external API keys or production database credentials.
2. **Strict Security Boundaries:** Prevent any scenario where local development configurations (`USE_AUTH=false`) can be activated in a production environment.
3. **Pluggable Authentication Abstraction:** Abstract authentication behind a clean interface (`IAuthProvider`) so domain code remains entirely agnostic to whether authentication is handled by a local development provider or a production identity service.
4. **Single Codebase Integration:** Ensure all contributors, regardless of permission tier, write and test code on the same `main` branch.
5. **Tiered Access Model:** Seamlessly support Community Mode (local development database), Core Mode (staging credentials), and Production Mode through environment configuration alone.

## Decision

We decide to introduce an **Authentication Abstraction Layer** controlled by the `USE_AUTH` environment variable.

Authentication is decoupled from business domains and encapsulated behind a standard provider contract (`IAuthProvider`). The application dynamically injects the appropriate authentication provider based on the `USE_AUTH` environment configuration:

- When **`USE_AUTH=false`** (default for local community development), the system injects the `LocalDevAuthProvider` (Community Mode), providing an instant, pre-authenticated local session against an isolated Development Database.
- When **`USE_AUTH=true`** (staging and production), the system injects the `ProductionAuthProvider`, enforcing full identity validation, JWT verification, and secure database access control.

Direct imports of third-party authentication SDKs within domain modules (`src/domains/`) are strictly forbidden. All session retrieval, identity verification, and permission checks must flow through the central Authentication Layer located in `src/shared/lib/auth`, consistent with the shared infrastructure boundaries established in [ADR-003](./ADR-003-Project-Structure.md).

---

## Authentication Philosophy

1. **Security by Default:** Production environments strictly require authentication (`USE_AUTH=true`). The application must throw a fatal startup error if `USE_AUTH=false` is detected in a production build (`NODE_ENV=production`).
2. **Infrastructure, Not Domain Logic:** Authentication is an infrastructure concern housed in `src/shared/lib/auth`. Business domains (`src/domains/goals`, `src/domains/knowledge`) consume identity contracts (`AuthUser`, `AuthSession`) but never manage auth implementation details.
3. **Environment-Driven Configuration:** Behavior is governed entirely by standard environment variables (`.env.local`), never by git branch switches or code modifications. This directly replaces the legacy branch-based isolation deprecated by [ADR-001](./ADR-001-Branching-Strategy.md).
4. **Explicit Boundary Verification:** Every Server Action and API Route must validate caller identity through the Authentication Gateway before executing business logic.

---

## High-Level Architecture Overview

The Authentication Layer serves as a mediating boundary between the application's entry points and the business domain layer. All identity resolution flows through a single gateway that delegates to the active provider, which in turn communicates with the appropriate data tier.

```mermaid
graph TD
    subgraph Application Entry Points
        Pages["Next.js Pages & Layouts<br>(src/app/)"]
        ServerActions["Server Actions<br>(src/domains/*/actions/)"]
        API["API Routes<br>(src/app/api/)"]
    end

    subgraph Authentication Layer ["Authentication Layer (src/shared/lib/auth/)"]
        Gateway["Authentication Gateway<br>serverAuth / useAuthClient"]
        Contract["IAuthProvider Contract"]
        Gateway --> Contract
    end

    subgraph Providers
        LocalDev["LocalDevAuthProvider<br>(USE_AUTH=false)"]
        Production["ProductionAuthProvider<br>(USE_AUTH=true)"]
    end

    subgraph Data Tier
        DevDB["Development Database<br>(local PostgreSQL)"]
        ProdDB["Production Database<br>(Neon Cluster)"]
    end

    subgraph Business Domains ["Business Domains (src/domains/)"]
        Goals["Goals"]
        Knowledge["Knowledge"]
        Reviews["Reviews"]
        Sessions["Sessions"]
        Analytics["Analytics"]
    end

    Pages --> Gateway
    ServerActions --> Gateway
    API --> Gateway

    Contract --> LocalDev
    Contract --> Production

    LocalDev --> DevDB
    Production --> ProdDB

    Gateway --> Business Domains
```

The critical architectural invariant is that business domains never interact with authentication providers directly. They consume only the `AuthUser` and `AuthSession` contracts returned by the Authentication Gateway.

---

## Architecture of the Authentication Layer

The Authentication Layer lives in `src/shared/lib/auth/` as defined by the shared infrastructure boundaries in [ADR-003](./ADR-003-Project-Structure.md). It consists of three core components:

1. **Identity Contract (`IAuthProvider`):** A strongly-typed interface defining all authentication capabilities. Every provider—current and future—must implement this contract without exception.
2. **Provider Implementations:**
   - `LocalDevAuthProvider`: Returns a deterministic Community Contributor session instantly, with zero external dependencies.
   - `ProductionAuthProvider`: Validates tokens and manages sessions against live identity services.
3. **Authentication Gateway (`serverAuth` / `useAuthClient`):** The single entry point used by Server Actions, Route Handlers, and Client Components to obtain current session data. The gateway resolves the active provider at startup and delegates all calls transparently.

```text
src/shared/lib/auth/
├── contracts/
│   └── IAuthProvider.ts        # Uniform interface for all providers
├── providers/
│   ├── LocalDevAuthProvider.ts  # Community Mode (USE_AUTH=false)
│   └── ProductionAuthProvider.ts# Production Mode (USE_AUTH=true)
├── gateway/
│   ├── serverAuth.ts            # Server-side auth for Server Actions
│   └── clientAuth.ts            # React context for Client Components
└── index.ts                     # Factory exporting the active provider
```

---

## Modes of Operation

### 1. Community Mode (`USE_AUTH=false`)

Designed for Community Contributors ([ADR-004](./ADR-004-Contributor-Workflow.md)) and local feature development.

- **Environment Flag:** `USE_AUTH=false`
- **Database:** Development Database (local PostgreSQL or isolated Neon dev branch).
- **Authentication Behavior:** No login or registration required. The `LocalDevAuthProvider` automatically returns a deterministic local developer identity (see [Development Identity](#development-identity) below).
- **External Dependencies:** Zero. Requires no API keys for Resend, Turnstile, or OAuth providers.

### 2. Core Mode (`USE_AUTH=true` with Staging Credentials)

Designed for Core Contributors and Maintainers ([ADR-004](./ADR-004-Contributor-Workflow.md)) testing end-to-end authentication flows, OAuth redirects, and email magic links against staging environments.

- **Environment Flag:** `USE_AUTH=true`
- **Database:** Development / Staging Database.
- **Authentication Behavior:** Full authentication pipeline active, connected to staging identity providers.
- **Credentials Required:** Staging API keys configured in `.env.local`.

### 3. Production Mode (`USE_AUTH=true` in Production Build)

The live production environment serving end users.

- **Environment Flag:** `USE_AUTH=true` (Strictly enforced; `NODE_ENV=production` rejects `USE_AUTH=false`).
- **Database:** Production Database (Neon Production Cluster).
- **Authentication Behavior:** Full cryptographic JWT verification, rate limiting, Turnstile bot protection, secure HTTP-only cookies, and production identity persistence.

---

## Development Identity

When operating in Community Mode (`USE_AUTH=false`), the `LocalDevAuthProvider` returns a **deterministic, hardcoded development user identity**. This identity must remain stable across all installations and must never be randomized.

The development identity uses the following fixed values:

| Field | Value |
| :--- | :--- |
| `id` | `community-dev-user-id` |
| `email` | `dev@codexedoc.local` |
| `name` | `Community Contributor` |
| `role` | `community_contributor` |

**Why determinism is architecturally required:**

- **Repeatable Database Seeds:** Seed scripts (`npm run db:seed`) reference the deterministic user ID to create sample Goals, Knowledge items, and Reviews. If the ID changed per session, seeded data would become orphaned.
- **Reliable Automated Tests:** Integration and end-to-end tests assert against known user identifiers. Non-deterministic IDs would make tests flaky and unmaintainable.
- **Consistent Local Development:** When a contributor stops and restarts the development server, previously created data remains correctly associated with the same development user.
- **Predictable Data Ownership:** All locally created records belong to a single, known identity, simplifying debugging, data inspection, and database cleanup.

---

## Authentication Provider Abstraction

All authentication mechanisms implement the `IAuthProvider` contract. This interface defines the complete surface area of authentication capabilities available to the application. Domain code interacts exclusively with this contract; it never references provider implementations directly.

The contract defines the following capabilities:

- **Session Retrieval** (`getSession`): Returns the current authenticated session, or `null` if no session exists.
- **User Retrieval** (`getUser`): Returns the authenticated user identity, or `null`.
- **Mandatory User Retrieval** (`requireUser`): Returns the authenticated user or throws an `UnauthorizedError`. This is the primary method used by Server Actions to enforce access control.
- **Login** (`login`): Authenticates a user with the provided credentials and returns a new session.
- **Logout** (`logout`): Invalidates the current session and clears client-side tokens.
- **Token Verification** (`verifyToken`): Validates a session token and returns its validity status.

Both `LocalDevAuthProvider` and `ProductionAuthProvider` return identical `AuthUser` and `AuthSession` structures, ensuring that domain code behaves identically regardless of the active provider. The `AuthUser` role field aligns directly with the contributor levels defined in [ADR-004](./ADR-004-Contributor-Workflow.md): `visitor`, `community_contributor`, `core_contributor`, `maintainer`, and `founder`.

---

## Database Strategy: Development vs. Production

To complement the authentication abstraction, database access is segregated into explicit tiers governed by environment configuration:

### Development Database (Community Tier)
- **Target:** Local PostgreSQL Docker container or isolated Neon development branch specified by `DATABASE_URL`.
- **Access:** Unrestricted access for Community Contributors.
- **Migrations:** Applied locally via `npm run db:migrate`.
- **Data Policy:** Contains non-sensitive sample/seed data generated via `npm run db:seed`. Seed data is associated with the deterministic development identity.

### Production Database (Core Tier)
- **Target:** Production Neon PostgreSQL cluster.
- **Access:** Strictly restricted to automated CI/CD deployment pipelines and designated Maintainers.
- **Data Policy:** Encrypted at rest and in transit; no Community Contributor has access to production data or connection strings.

---

## Security Boundaries & Production Hardening

To guarantee that `USE_AUTH=false` can never compromise production security, the system enforces hard runtime safeguards:

1. **Production Lock:** The Authentication Gateway must verify on startup that `USE_AUTH=false` is never active when `NODE_ENV=production`. If detected, the application must crash immediately with a fatal error. This is a non-negotiable safety invariant.
2. **Server Action Enforcement:** Every business action in `src/domains/` must call `requireUser()` from the Authentication Gateway before performing any database mutation. This guarantees that identity resolution always flows through the provider abstraction—returning the deterministic development user in Community Mode and a fully validated user in Production Mode.
3. **HTTP-Only Cookies:** In production, session tokens are stored exclusively in `SameSite=Lax`, `Secure`, `HttpOnly` cookies, preventing client-side JavaScript from accessing token values.
4. **Secret Isolation:** `.env.example` contains zero sensitive values. Production secrets live exclusively in deployment platform secrets (Vercel / GitHub Actions) and are never committed to the repository.

---

## Role-Based Access Control (RBAC)

CODEXEDOC implements a tiered permission model that maps directly to the contributor hierarchy defined in [ADR-004 (Contributor Workflow)](./ADR-004-Contributor-Workflow.md). Roles are assigned at the identity level via the `AuthUser.role` field and enforced by the Authentication Gateway.

### Role Summary

| Role | Primary Environment | Description |
| :--- | :--- | :--- |
| **Visitor** | Production | Unauthenticated or read-only users browsing public content. |
| **Community Contributor** | Community Mode | Open-source developers working locally against the Development Database. |
| **Core Contributor** | Core Mode | Trusted contributors with staging access and PR approval rights. |
| **Maintainer** | Production | Project leaders with merge, release, and deployment authority. |
| **Founder / COO** | All | Administrative ownership across all systems and environments. |

### Permission Matrix

The following matrix specifies the authorized operations for each role across the application:

| Permission | Visitor | Community Contributor | Core Contributor | Maintainer | Founder / COO |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Public Pages | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create Knowledge | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Knowledge | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage Goals | ❌ | ✅ | ✅ | ✅ | ✅ |
| Review Sessions | ❌ | ✅ | ✅ | ✅ | ✅ |
| Access Development Database | ❌ | ✅ | ✅ | ✅ | ✅ |
| Access Production Database | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve Pull Requests | ❌ | ❌ | ✅ | ✅ | ✅ |
| Merge Pull Requests | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage GitHub Repository | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Contributors | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Environment Secrets | ❌ | ❌ | ❌ | ✅ | ✅ |
| Deploy Production | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Administration | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Environment Variables Specification

The `.env.example` file is configured out-of-the-box for **Community Mode**:

```env
# ==========================================
# CODEXEDOC Environment Configuration
# ==========================================

# Authentication Mode (false = Community Mode, true = Enforced Auth)
USE_AUTH=false

# Database Connection (Development Database)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codexedoc_dev

# Optional External Keys (Only required if USE_AUTH=true)
RESEND_API_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
JWT_SECRET=development-secret-only-do-not-use-in-prod
```

---

## Mermaid Diagrams

### 1. Authentication Provider Resolution Flow

```mermaid
flowchart TD
    AppStart[Application Boot] --> CheckEnv{Check process.env.NODE_ENV}
    
    CheckEnv -- production --> CheckAuthProd{USE_AUTH == false?}
    CheckAuthProd -- Yes --> FatalError[FATAL ERROR: Crash Startup]
    CheckAuthProd -- No --> InjectProd[Inject ProductionAuthProvider]
    
    CheckEnv -- development --> CheckAuthDev{USE_AUTH == true?}
    CheckAuthDev -- Yes --> InjectProd
    CheckAuthDev -- No --> InjectLocal[Inject LocalDevAuthProvider]
    
    InjectProd --> AuthGateway[Auth Gateway Interface: IAuthProvider]
    InjectLocal --> AuthGateway
    
    AuthGateway --> Domains[Business Domains / src/domains/]
```

### 2. Community Mode Authentication Sequence (`USE_AUTH=false`)

```mermaid
sequenceDiagram
    participant Contributor as Community Developer
    participant Browser as Client Browser
    participant ServerAction as Server Action (src/domains/goals)
    participant AuthGateway as Auth Gateway (src/shared/lib/auth)
    participant DevDB as Development Database
    
    Contributor->>Browser: Click "Create Goal"
    Browser->>ServerAction: Call createGoalAction(input)
    ServerAction->>AuthGateway: serverAuth.requireUser()
    Note over AuthGateway: USE_AUTH=false detected
    AuthGateway-->>ServerAction: Return Deterministic Dev User
    ServerAction->>DevDB: INSERT INTO goals (user_id, ...)
    DevDB-->>ServerAction: Return Created Goal
    ServerAction-->>Browser: Success Response UI Update
```

### 3. Production Authentication Sequence (`USE_AUTH=true`)

```mermaid
sequenceDiagram
    participant User as Production User
    participant Browser as Client Browser
    participant Middleware as Next.js Middleware
    participant AuthGateway as Auth Gateway (ProductionAuthProvider)
    participant ProdDB as Production Database
    
    User->>Browser: Access /dashboard
    Browser->>Middleware: Request /dashboard with HTTP-only Cookie
    Middleware->>AuthGateway: verifyToken(cookieToken)
    AuthGateway->>ProdDB: Validate Session Record
    
    alt Session Valid
        ProdDB-->>AuthGateway: Session Active
        AuthGateway-->>Middleware: User Identity Verified
        Middleware-->>Browser: Render Dashboard Page
    else Session Expired / Invalid
        AuthGateway-->>Middleware: Session Invalid
        Middleware-->>Browser: Redirect to /login
    end
```

### 4. RBAC Enforcement Flow

```mermaid
flowchart TD
    Request[Incoming Request] --> Gateway[Authentication Gateway]
    Gateway --> Resolve{Resolve AuthUser}
    Resolve --> RoleCheck{Check AuthUser.role}
    
    RoleCheck -- visitor --> PublicOnly[Allow Public Pages Only]
    RoleCheck -- community_contributor --> DevAccess[Allow Dev DB Operations]
    RoleCheck -- core_contributor --> StagingAccess[Allow Staging + PR Approvals]
    RoleCheck -- maintainer --> ProdAccess[Allow Production + Merge + Deploy]
    RoleCheck -- founder --> FullAccess[Allow All Operations]
```

---

## Migration Strategy

The migration from the legacy `mock` branch auth model to the Authentication Abstraction Layer is executed in 5 safe steps, aligned with the branching migration plan in [ADR-001](./ADR-001-Branching-Strategy.md):

1. **Core Abstraction Definition:** Merge `IAuthProvider` interface and `serverAuth` gateway into `src/shared/lib/auth`.
2. **Local Provider Implementation:** Implement `LocalDevAuthProvider` providing the deterministic development identity when `USE_AUTH=false`.
3. **Production Provider Wrap:** Wrap existing production auth queries inside `ProductionAuthProvider`.
4. **Domain Refactoring:** Update all Server Actions in `src/domains/` to retrieve users strictly via `serverAuth.requireUser()`, consistent with the domain boundaries in [ADR-003](./ADR-003-Project-Structure.md).
5. **Environment Configuration Update:** Update `.env.example` to default to `USE_AUTH=false` and delete all legacy `mock` branch dependencies.

---

## Advantages

- **Zero Onboarding Friction:** New Community Contributors can clone and run the app in minutes without external service credentials.
- **Uncompromised Security:** Production identity secrets remain protected and isolated from open-source contributors.
- **Single Source of Truth:** All developers work on `main`, eliminating branch divergence per [ADR-001](./ADR-001-Branching-Strategy.md).
- **Domain Independence:** Business features in `src/domains/` are totally decoupled from auth provider details, preserving the domain boundaries of [ADR-003](./ADR-003-Project-Structure.md).
- **Testability:** Unit testing server actions becomes trivial by running against `LocalDevAuthProvider` with its deterministic identity.

## Trade-offs & Disadvantages

- **Configuration Awareness:** Developers must understand the role of `.env.local` and `USE_AUTH`. This is mitigated by defaulting `.env.example` to Community Mode.
- **Provider Parity Requirement:** The `LocalDevAuthProvider` must produce `AuthUser` and `AuthSession` objects structurally identical to `ProductionAuthProvider` to ensure local testing accurately reflects production behavior.

---

## Alternatives Considered

1. **Mandatory Third-Party Credentials for All Developers:**  
   *Rejected.* Requiring every contributor to register for Resend, Turnstile, and Neon production instances creates immense friction and deters community contributions.
2. **Maintaining the Dual `main`/`mock` Branch System:**  
   *Rejected per [ADR-001](./ADR-001-Branching-Strategy.md).* Dual long-lived branches caused catastrophic code divergence and complex merge conflicts.
3. **Hardcoding `if (process.env.NODE_ENV === 'development')` Checks:**  
   *Rejected.* Scattering conditional checks throughout business components violates Domain-Driven Design ([ADR-003](./ADR-003-Project-Structure.md)) and introduces severe risk of accidental security bypasses.
4. **Authentication Abstraction Layer with `USE_AUTH` Flag:**  
   *Accepted.* Encapsulating auth behind `IAuthProvider` keeps domain code pure while permitting zero-friction local execution.

---

## Best Practices

1. **Always use `serverAuth.requireUser()`:** Server Actions must never assume caller identity; always validate via the Authentication Gateway.
2. **Default `USE_AUTH=false` in `.env.example`:** Ensure first-time clones work out of the box for Community Contributors.
3. **Crash early in production:** Instantly throw a fatal error if `USE_AUTH=false` in `NODE_ENV=production`.
4. **Keep auth in `src/shared/lib/auth`:** Never place authentication provider implementations inside business domains.
5. **Never commit `.env.local`:** Add `.env.local` to `.gitignore` and enforce via pre-commit hooks.
6. **Use HTTP-only cookies in production:** Prevent client-side XSS token theft.
7. **Return strongly-typed `AuthUser` objects:** Avoid returning raw database user models containing password hashes or internal metadata.
8. **Do not mix auth logic with UI:** UI components should check boolean flags from `useAuthClient()`, not execute auth logic.
9. **Seed local development databases:** Provide `npm run db:seed` so Community Mode has rich test data immediately available, associated with the deterministic development identity.
10. **Test both provider modes in CI:** Run unit tests against both `LocalDevAuthProvider` and `ProductionAuthProvider`.
11. **Sanitize user inputs:** Always pass login credentials through Zod schemas before provider invocation.
12. **Keep session tokens short-lived:** Enforce automatic token rotation in `ProductionAuthProvider`.
13. **Isolate dev database connections:** Ensure `DATABASE_URL` in `.env.example` points to localhost or an isolated dev branch.
14. **Document auth configuration in `README.md`:** Maintain clear instructions for toggling `USE_AUTH`.
15. **Use standard error types:** Throw standard `UnauthorizedError` or `ForbiddenError` from the Authentication Gateway.
16. **Colocate auth types:** Keep `IAuthProvider` clean and fully documented with TSDoc.
17. **Never pass production keys in PRs:** Scrub all PR diffs for accidental credential inclusions per the review standards in [ADR-004](./ADR-004-Contributor-Workflow.md).
18. **Support graceful logout:** Ensure `logout()` invalidates server sessions and clears client cookies simultaneously.
19. **Log auth failures responsibly:** Log authentication failures without exposing user passwords or secret tokens.
20. **Audit RBAC permissions regularly:** Keep permission matrices aligned with community roles defined in [ADR-004](./ADR-004-Contributor-Workflow.md).
21. **Enforce HTTPS in production:** Require secure transport for all authentication token transfers.
22. **Use constant-time string comparisons:** Prevent timing attacks when verifying tokens.
23. **Abstract third-party SDK imports:** Wrap third-party libraries (e.g., Lucia, NextAuth) inside `ProductionAuthProvider`, never expose them to domain code.
24. **Provide a visual indicator in Community Mode:** Display a small, non-intrusive UI badge when `USE_AUTH=false` is active so developers maintain awareness of the current mode.
25. **Review security boundary changes:** Any modification to `src/shared/lib/auth` requires approval from at least two Maintainers.

---

## Anti-Patterns

- **Direct SDK Imports in Domains:** Importing an external auth SDK inside `src/domains/goals/actions/createGoal.ts` violates the domain isolation rules of [ADR-003](./ADR-003-Project-Structure.md).
- **Hardcoding Passwords/Secrets:** Placing fallback secret strings in `LocalDevAuthProvider.ts`.
- **Bypassing the Gateway:** Querying the database directly for sessions without invoking the `IAuthProvider` contract.
- **Silent Failures in Production:** Disabling auth silently when an external API key is missing in production.
- **Using "Mock" Branch Terminology:** Referring to `USE_AUTH=false` as the "mock branch" instead of "Community Mode."
- **Leaking Production DB URLs:** Hardcoding staging or production database connection strings in public files.
- **Ignoring Session Expiry:** Failing to check session expiration timestamps in server actions.
- **Non-Deterministic Dev Identity:** Generating random user IDs in `LocalDevAuthProvider`, which breaks database seeds, automated tests, and local data persistence.

---

## Future Evolution

The Authentication Abstraction Layer is designed around the **Open/Closed Principle**: the system is open for extension by adding new provider implementations, but closed for modification of the core `IAuthProvider` contract, the Authentication Gateway, or any business domain code.

When a new authentication mechanism is required, the implementation process is:

1. Create a new class implementing the `IAuthProvider` contract.
2. Register the new provider in the factory (`src/shared/lib/auth/index.ts`) behind an environment configuration flag.
3. No modifications to `src/domains/`, `src/app/`, or any existing provider are required.

Business domains must **never** require modification when introducing a future authentication provider. The gateway resolves the active provider transparently, and all domain code interacts exclusively with the `AuthUser` and `AuthSession` contracts.

### Planned Extension Points

As CODEXEDOC scales, the following providers can be introduced without architectural changes:

- **Enterprise SSO / SAML 2.0:** An `EnterpriseSAMLAuthProvider` for institutional deployments where organizations require federated identity management.
- **OpenID Connect (OIDC):** An `OIDCAuthProvider` supporting standard OIDC flows for compatibility with Google, Microsoft, and other identity platforms.
- **OAuth2 Social Providers:** Dedicated OAuth2 implementations for GitHub, Google, and other social login flows.
- **WebAuthn / Passkeys:** A `PasskeyAuthProvider` introducing biometric passwordless authentication.
- **Magic Links:** A `MagicLinkAuthProvider` supporting email-based passwordless login.
- **Custom Identity Providers:** Third-party or self-hosted identity services used in private deployments.
- **Multi-Tenant RBAC:** Expanding `AuthUser` roles to support organization-level permissions and team collaboration.
- **OAuth2 Provider Capabilities:** Enabling CODEXEDOC to act as an OAuth2 identity provider for third-party plugin developers.

Each of these extensions follows the identical pattern: implement `IAuthProvider`, register behind a configuration flag, deploy. Zero domain code changes required.

---

## Consequences

### Positive
- Community onboarding time is reduced from hours/days to minutes.
- Production secrets are completely isolated from open-source contributors.
- Code divergence is eliminated by maintaining a single codebase (`main`).
- Business domain code remains pure, testable, and framework-agnostic.
- The deterministic development identity enables reliable automated testing and repeatable database seeds.

### Negative
- Maintainers must ensure the `LocalDevAuthProvider` stays aligned with production session schemas whenever the `IAuthProvider` contract evolves.
- Developers must maintain awareness of environment configuration flags (`USE_AUTH`), though defaulting to Community Mode minimizes friction.

---

## Operational Impact

This section describes how the Authentication Abstraction Layer changes day-to-day engineering operations for the CODEXEDOC project.

### Community Contributor Onboarding
Previously, new contributors needed to either work on a separate `mock` branch (with divergent code) or obtain production credentials from maintainers. Under the new architecture, onboarding is reduced to three commands: `git clone`, `npm install`, `npm run dev`. The `.env.example` file ships with `USE_AUTH=false` by default, and the deterministic development identity provides immediate access to all application features against the Development Database. No external accounts, API keys, or maintainer intervention required.

### Local Development Workflow
Contributors develop features on short-lived feature branches from `main` as specified in [ADR-001](./ADR-001-Branching-Strategy.md). Authentication is transparent—`serverAuth.requireUser()` resolves the deterministic development user automatically. Contributors can focus entirely on business logic within their domain ([ADR-003](./ADR-003-Project-Structure.md)) without configuring identity providers.

### Maintainer Workflow
Maintainers and Core Contributors who need to test production authentication flows simply set `USE_AUTH=true` in their `.env.local` and configure staging API keys. The same codebase, the same branch, the same domain code—only the injected provider changes. This eliminates the duplicate maintenance burden that existed under the legacy dual-branch system.

### Pull Request Process
Every Pull Request targets `main` as the single source of truth ([ADR-001](./ADR-001-Branching-Strategy.md)). Reviewers verify that Server Actions call `serverAuth.requireUser()` and that no direct auth SDK imports exist in domain code. CI pipelines can run tests against both `LocalDevAuthProvider` and `ProductionAuthProvider` to verify behavioral parity.

### Elimination of Long-Lived Branches
The `mock` branch—the historical mechanism for isolating community development—is permanently deprecated. Environment configuration (`USE_AUTH`) replaces branch-based isolation entirely. This eliminates:
- Merge conflicts between `main` and `mock`.
- Duplicated feature implementations across branches.
- Cognitive overhead of tracking which branch holds the "correct" version.
- Onboarding confusion about which branch to target.

### Measurable Impact
- **Onboarding Time:** Reduced from hours/days to under 5 minutes.
- **Maintenance Effort:** Eliminated dual-branch synchronization overhead.
- **Merge Conflicts:** Reduced by consolidating all work on `main`.
- **Contributor Experience:** Simplified by providing a single, predictable development setup.
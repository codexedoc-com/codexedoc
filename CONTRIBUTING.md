# Contributing to CODEXEDOC

Thank you for your interest in contributing to **CODEXEDOC**! We are building an open-source Learning Operating System designed to empower learners through evidence-based cognitive science.

We welcome contributions of all kinds: bug fixes, feature implementations, documentation improvements, unit tests, and design enhancements.

This document provides a step-by-step guide to help you get started quickly and smoothly.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Quick Start Onboarding](#quick-start-onboarding)
- [Understanding Community Mode](#understanding-community-mode)
- [Architectural Invariants (What NOT to Modify)](#architectural-invariants-what-not-to-modify)
- [Development Workflow](#development-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Quality Standards & Build Validation](#quality-standards--build-validation)
- [Community Roles & Progression](#community-roles--progression)
- [Getting Help](#getting-help)

---

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md). Please be respectful, constructive, and welcoming in all interactions.

---

## Quick Start Onboarding

Getting started with CODEXEDOC takes under 2 minutes:

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/codexedoc.git
cd codexedoc

# 2. Install dependencies using pnpm
pnpm install

# 3. Create your local environment configuration from template
cp .env.example .env.local

# 4. Start the local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will land directly in **Community Mode** with a fully functional dashboard and test data available out of the box!

---

## Understanding Community Mode

CODEXEDOC operates on an environment-driven authentication architecture defined in [ADR-002](./docs/architecture/ADR-002-Authentication.md).

By default, `.env.example` ships with:

```env
USE_AUTH=false
```

### Key Principles of Community Mode:
1. **Zero Setup Friction:** You do NOT need cloud accounts, API keys (Resend, Turnstile, Neon), or local PostgreSQL database configurations.
2. **Deterministic Developer Identity:** The system automatically authenticates you as `mock-user` (`Mock Learner`, `demo@codexedoc.com`).
3. **Data Persistence:** Sample Goals, Categories, and Knowledge Items remain intact across server restarts.
4. **Server-Side Identity:** Even in Community Mode, Server Actions resolve caller identity via `serverAuth.requireUser()`. The frontend never sends or controls user identifiers.

---

## Architectural Invariants (What NOT to Modify)

To maintain a clean, stable architecture across our open-source contributor ecosystem, please adhere strictly to these architectural boundaries:

> 🛑 **DO NOT MODIFY:**
> - **Provider Contracts (`lib/auth/contracts/IAuthProvider.ts`):** The core authentication interface must remain uniform.
> - **Authentication Gateway (`lib/auth/gateway/serverAuth.ts`):** Gateway resolution logic is locked.
> - **Local Development Provider (`lib/auth/providers/LocalDevAuthProvider.ts`):** Local dev provider behavior must remain deterministic.
> - **Production Auth Provider (`lib/auth/providers/ProductionAuthProvider.ts`):** Changes to production auth require Maintainer review.
> - **Domain Boundaries (`server/actions/`, `server/mutations/`):** Server actions must consume `serverAuth.requireUser()`. Never pass `userId` as a parameter from client components.

---

## Development Workflow

CODEXEDOC follows single-branch consolidation on `main` per [ADR-001](./docs/architecture/ADR-001-Branching-Strategy.md).

1. **Keep `main` Updated:** Sync your local `main` branch with upstream before starting new work:
   ```bash
   git checkout main
   git pull upstream main
   ```
2. **Create a Feature Branch:** Branch off `main` using our naming conventions:
   ```bash
   git checkout -b feature/add-item-tagging
   ```
3. **Implement Changes:** Write clean TypeScript code following domain-driven boundaries ([ADR-003](./docs/architecture/ADR-003-Project-Structure.md)).
4. **Validate Your Work:** Run build and typechecks locally before committing (see below).

---

## Branch Naming Conventions

Use clear, descriptive prefix names for your branches:

- `feature/short-description` — New features or UI additions (e.g. `feature/dark-mode-toggle`)
- `fix/short-description` — Bug fixes and patch resolutions (e.g. `fix/session-timer-overflow`)
- `docs/short-description` — Documentation additions or edits (e.g. `docs/update-adr-002`)
- `refactor/short-description` — Code improvements without functional changes (e.g. `refactor/query-actions`)

---

## Commit Message Guidelines

We follow **Conventional Commits** to keep our git history readable and automated release notes clean:

```text
<type>(<scope>): <short description>
```

### Allowed Types:
- `feat`: A new feature for users
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Formatting, missing semi-colons, whitespace fixes
- `refactor`: Refactoring production code without behavior changes
- `test`: Adding or correcting tests
- `chore`: Build process, package updates, or tool maintenance

### Examples:
```bash
git commit -m "feat(items): add tag filtering to knowledge items list"
git commit -m "fix(auth): handle expired session token gracefully"
git commit -m "docs(readme): update onboarding quickstart steps"
```

---

## Pull Request Process

1. **Title:** Use Conventional Commit format for your PR title (e.g., `feat(ui): add Community Mode badge`).
2. **Description:** Fill out the PR template describing:
   - What changed
   - Why the change was made
   - How you verified your changes
3. **Keep PRs Focused:** Small, single-purpose Pull Requests are reviewed and merged significantly faster than large multi-feature PRs.
4. **Build Check:** Ensure `pnpm run build` succeeds cleanly before requesting review.

---

## Quality Standards & Build Validation

Before submitting your Pull Request, run local verification:

```bash
# 1. Typecheck TypeScript across the project
npx tsc --noEmit

# 2. Verify Next.js production build
pnpm run build
```

Your Pull Request will automatically run CI checks against both `LocalDevAuthProvider` and `ProductionAuthProvider` to ensure behavioral parity.

---

## Community Roles & Progression

CODEXEDOC encourages a structured progression for contributors per [ADR-004](./docs/architecture/ADR-004-Contributor-Workflow.md):

- **Community Contributor:** Clones the repository, submits bug reports, fixes issues, improves docs, and submits PRs.
- **Core Contributor:** Experienced contributors who understand domain boundaries, review community PRs, and guide new contributors.
- **Maintainer:** Responsible for overall project direction, architecture reviews, release tagging, and deployments.
- **Founder / COO:** Oversees project vision, legal governance, and long-term organizational strategy.

---

## Getting Help

We want your contributor experience to be fantastic! If you have questions or need guidance:

- Open a GitHub Discussion or Issue.
- Tag your issue with `question` or `good-first-issue`.
- Join our community Discord and chat in `#contributing`.

Thank you for helping make CODEXEDOC better for learners everywhere! 🚀
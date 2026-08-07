# CODEXEDOC — Learning Operating System

[![License](https://img.shields.io/github/license/codexedoc-com/codexedoc)](https://github.com/codexedoc-com/codexedoc/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/codexedoc-com/codexedoc)](https://github.com/codexedoc-com/codexedoc/issues)
[![Contributors](https://img.shields.io/github/contributors/codexedoc-com/codexedoc)](https://github.com/codexedoc-com/codexedoc/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/codexedoc-com/codexedoc)](https://github.com/codexedoc-com/codexedoc/stargazers)

**CODEXEDOC** is an open-source **Learning Operating System** designed to help learners organize knowledge, build structured study habits, and achieve long-term mastery using evidence-based learning science.

> 🚧 **Project Status:** Active Community Development (`main` branch consolidation). Built for frictionless open-source contribution out of the box using **Community Mode**.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Why CODEXEDOC?](#why-codexedoc)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Quick Start Onboarding](#quick-start-onboarding)
- [Community Mode](#community-mode)
- [Project Structure](#project-structure)
- [Documentation Index](#documentation-index)
- [Contribution & Branch Strategy](#contribution--branch-strategy)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License](#license)

---

## Overview

CODEXEDOC is more than a flashcard tool or note-taking application. It is a comprehensive framework that connects courses, books, articles, and personal projects into a unified learning journey.

Rather than replacing learning content, CODEXEDOC provides the structured engine that guides practice, retains information, and tracks progress over time.

### Key Capabilities:
- **Goal Blueprinting:** Define clear learning objectives and track target completion dates.
- **Knowledge Hierarchy:** Categorize learning notes into structured learning areas.
- **Active Recall & Spaced Repetition:** Schedule reviews based on difficulty and mastery levels.
- **Progress & Analytics:** Monitor retention rates, study streaks, and study session lengths.
- **Skill Trees:** Visualize domain progression across custom skill hierarchies.

---

## Core Features

| Feature | Description |
|:---|:---|
| 🎯 **Goal Management** | Track active goals, daily target minutes, and deadline timelines |
| 🏷️ **Knowledge Areas** | Group flashcards, vocabulary, concepts, and facts into custom categories |
| 🔁 **Active Recall** | Practice prompt-and-answer retrieval to strengthen long-term memory |
| 📊 **Analytics Dashboard** | Track daily progress, reviews due, retention rates, and study streaks |
| 🌳 **Interactive Skill Trees** | View visual representations of mastery across subject areas |
| ⚡ **Community Mode** | Run the complete application locally without API keys or production databases |

---

## Why CODEXEDOC?

Learning materials are abundant, but evidence-based systems that structure long-term retention are rare. CODEXEDOC merges principles from cognitive science—such as active retrieval and spaced intervals—into an intuitive interface so learners can spend less time organizing notes and more time mastering topics.

---

## System Architecture

CODEXEDOC follows a **Domain-Driven Architecture** and an **Environment-Driven Authentication Layer** designed to keep domain logic independent of external identity providers or database tiers.

```text
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                  │
│                     (src/app/ & UI)                     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Authentication Gateway (serverAuth)         │
│          Reads USE_AUTH env flag & injects provider     │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
  ┌─────────────────────────┐  ┌─────────────────────────┐
  │   LocalDevAuthProvider  │  │ ProductionAuthProvider  │
  │   (USE_AUTH=false)      │  │ (USE_AUTH=true)         │
  │   Zero external keys    │  │ HTTP Cookies, Tokens,   │
  │   Deterministic User    │  │ Production Database     │
  └────────────┬────────────┘  └───────────┬─────────────┘
               │                           │
               └─────────────┬─────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Business Domain Layer (src/domains)        │
│          Server Actions consume serverAuth.requireUser() │
└─────────────────────────────────────────────────────────┘
```

For detailed architectural decisions, see our [Architecture Decision Records (ADRs)](#documentation-index).

---

## Prerequisites

Before setting up CODEXEDOC, ensure your development system has:

- **Node.js:** `v18.17.0` or higher (Node 20+ recommended)
- **pnpm:** `v8.x` or higher (`corepack enable pnpm` or `npm i -g pnpm`)
- **Git:** `v2.30+`

---

## Quick Start Onboarding

Set up and run CODEXEDOC locally in under **2 minutes**:

```bash
# 1. Clone the repository
git clone https://github.com/codexedoc-com/codexedoc.git
cd codexedoc

# 2. Install dependencies using pnpm
pnpm install

# 3. Create your local environment configuration from template
cp .env.example .env.local

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will land directly in **Community Mode** with a fully functional dashboard and seeded test data!

---

## Community Mode

To eliminate friction for open-source contributors, CODEXEDOC defaults to **Community Mode** (`USE_AUTH=false`).

### What is Community Mode?
- **Zero API Keys Required:** No accounts needed for Resend, Turnstile, or cloud databases.
- **Deterministic Identity:** Automatically authenticates as `mock-user` (`Mock Learner`, `demo@codexedoc.com`).
- **Data Stability:** Seeded mock data remains persistent across local server restarts.
- **Full Feature Access:** Create goals, categories, knowledge items, edit items, and view analytics locally out of the box.

```env
# .env.local
USE_AUTH=false
```

When `USE_AUTH=false` is active, a subtle **Community Mode** badge appears in the bottom right corner of the UI to remind developers they are working in a local mock environment.

---

## Project Structure

```text
codexedoc/
├── app/                        # Next.js App Router (Pages, Layouts, API Routes)
├── components/                 # Reusable React UI Components
│   └── CommunityModeBadge.tsx  # Non-intrusive Community Mode indicator
├── lib/
│   └── auth/                   # Authentication Abstraction Layer (ADR-002)
│       ├── contracts/          # Interface definitions (IAuthProvider.ts)
│       ├── providers/          # LocalDevAuthProvider & ProductionAuthProvider
│       ├── gateway/            # Server Auth Gateway (serverAuth.ts)
│       ├── session/            # Session Store Layer (sessionStore.ts)
│       ├── utils/              # Token & HTTP Cookie management
│       └── errors/             # Custom Auth Error Classes
├── server/
│   ├── actions/                # Server Actions (queryActions.ts)
│   ├── mutations/              # Server Action Mutations (appMutations.ts)
│   └── mockData.ts             # Deterministic Mock Data Tier
├── docs/                       # Architecture Decision Records (ADRs)
│   └── architecture/           # ADR-001, ADR-002, ADR-003, ADR-004
├── .env.example                # Documented Environment Template
├── CONTRIBUTING.md             # Contributor Guide
└── README.md                   # Project Overview & Setup
```

---

## Documentation Index

Explore our technical architecture and decision records in `docs/`:

- 📘 [ADR-001 — Branching Strategy Strategy](./docs/architecture/ADR-001-Branching-Strategy.md): Single-branch consolidation on `main`.
- 🔐 [ADR-002 — Authentication Architecture](./docs/architecture/ADR-002-Authentication.md): Provider abstraction & Community Mode.
- 🏗️ [ADR-003 — Project Structure](./docs/architecture/ADR-003-Project-Structure.md): Domain-driven directory boundaries.
- 👥 [ADR-004 — Contributor Workflow](./docs/architecture/ADR-004-Contributor-Workflow.md): Roles, PR standards, and review guidelines.
- 🗺️ [Project Roadmap](./docs/architecture/Roadmap.md): Multi-phase development strategy.
- 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md): Detailed guide for new contributors.

---

## Contribution & Branch Strategy

CODEXEDOC uses **single-branch consolidation** on `main` per [ADR-001](./docs/architecture/ADR-001-Branching-Strategy.md).

### Workflow Overview:
1. **Fork** the repository and create a feature branch off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Develop and test your changes locally using Community Mode (`USE_AUTH=false`).
3. Validate your code before opening a PR:
   ```bash
   pnpm run build
   ```
4. Submit a Pull Request targeting `main`.

For detailed conventions on branch naming, commit messages, and PR reviews, read [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Troubleshooting & FAQ

### Q: Do I need PostgreSQL installed to develop locally?
**A:** No! In Community Mode (`USE_AUTH=false`), CODEXEDOC runs entirely against the local deterministic memory provider out of the box.

### Q: `pnpm dev` throws `FATAL: USE_AUTH=false is not allowed when NODE_ENV=production`
**A:** Community Mode is strictly forbidden in production builds for security. If testing production builds locally, set `USE_AUTH=true` and configure `AUTH_SECRET` in `.env.local`.

### Q: How do I test production authentication?
**A:** Set `USE_AUTH=true` and `AUTH_SECRET=your-random-32-char-secret` in `.env.local`. The system will automatically switch from `LocalDevAuthProvider` to `ProductionAuthProvider`.

---

## License

Copyright © 2026 CODEXEDOC

Licensed under the **GNU Affero General Public License v3.0** (`AGPL-3.0-or-later`). See the [`LICENSE`](./LICENSE) file for details.

---

## Acknowledgements

CODEXEDOC exists thanks to our open-source community of developers, educators, and learners. Every issue, pull request, and architectural discussion helps shape the future of learning technology.
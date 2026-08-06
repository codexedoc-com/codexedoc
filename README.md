# CODEXEDOC

![License](https://img.shields.io/github/license/codexedoc-com/codexedoc)
![Issues](https://img.shields.io/github/issues/codexedoc-com/codexedoc)
![Contributors](https://img.shields.io/github/contributors/codexedoc-com/codexedoc)
![Stars](https://img.shields.io/github/stars/codexedoc-com/codexedoc)

**CODEXEDOC** is an open-source Learning Operating System designed to help people learn anything more effectively using evidence-based learning science.

> 🚧 **Project Status:** Active Development. APIs, architecture, and workflows may evolve as the project grows toward its first public release.

---

# Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Why CODEXEDOC?](#why-codexedoc)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Community Mode](#community-mode)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

# Overview

CODEXEDOC is more than a flashcard application or note-taking tool.

It is a **Learning Operating System** designed to help learners organize knowledge, build effective study habits, and achieve long-term mastery using proven learning science.

Rather than replacing books, courses, or teachers, CODEXEDOC provides the framework that connects them together.

Users can:

- Define learning goals
- Organize knowledge
- Practice Active Recall
- Schedule Spaced Repetition
- Track mastery
- Build learning habits
- Review progress over time

---

# Features

- 🎯 Goal Management
- 🧠 Learning Blueprints
- 📝 Knowledge Items
- 🔁 Active Recall
- 📅 Spaced Repetition
- ⏱️ Focus Sessions
- 📖 Reflection Journal
- 🌳 Skill Trees
- 📊 Learning Analytics
- 🏆 Mastery Tracking

---

# Why CODEXEDOC?

Learning resources are everywhere.

Learning systems are not.

CODEXEDOC combines evidence-based learning techniques into a single platform so users can focus on learning instead of managing disconnected notes, apps, and reminders.

---

# Tech Stack

- **Framework:** Next.js + TypeScript
- **Database:** Drizzle ORM + PostgreSQL (Neon)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Repository:** GitHub

---

# Getting Started

```bash
git clone https://github.com/codexedoc-com/codexedoc.git

cd codexedoc

npm install

npm run dev
```

The project uses an environment-driven authentication system.

See `.env.example` for local configuration.

---

# Community Mode

CODEXEDOC supports a **Community Mode** designed to make contributing simple.

By default:

```text
USE_AUTH=false
```

Community Mode provides:

- Zero production credentials required
- Local development database
- Deterministic development user
- Immediate onboarding for contributors

Maintainers and staging environments simply enable:

```text
USE_AUTH=true
```

This architecture replaces the previous long-lived `mock` branch and allows every contributor to work from the same codebase.

---

# Architecture

The project is evolving toward a Domain-Driven architecture.

```
src/
├── app/
├── domains/
├── shared/
├── components/
└── infrastructure/
```

Business domains remain independent from infrastructure concerns such as authentication, database access, and external services.

Additional architectural decisions are documented under `/docs`.

---

# Documentation

Project documentation lives under the `docs/` directory.

Key documents include:

- ADR-001 — Branching Strategy
- ADR-002 — Authentication Architecture
- ADR-003 — Project Structure
- ADR-004 — Contributor Workflow
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md

These documents describe the architectural decisions and contribution workflow used throughout the project.

---

# Contributing

We welcome contributors of every experience level.

If you'd like to contribute:

1. Read `CONTRIBUTING.md`
2. Browse open Issues
3. Join the Discord community
4. Submit a Pull Request

Our goal is to make contributing as frictionless as possible while maintaining a clean and secure architecture.

---

# License

Copyright © 2026 CODEXEDOC

Licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-or-later).**

See the `LICENSE` file for details.

---

# Acknowledgements

CODEXEDOC exists thanks to every developer, designer, educator, and learner who contributes to the project.

Every issue, discussion, and pull request helps improve the future of learning.

Thank you for being part of the project.
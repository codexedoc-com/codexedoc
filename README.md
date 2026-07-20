# CODEXEDOC

![License](https://img.shields.io/github/license/codexedoc-com/codexedoc)
![Issues](https://img.shields.io/github/issues/codexedoc-com/codexedoc)
![Contributors](https://img.shields.io/github/contributors/codexedoc-com/codexedoc)
![Stars](https://img.shields.io/github/stars/codexedoc-com/codexedoc)

**CODEXEDOC** is a Learning Operating System designed to help people learn anything more effectively using proven learning science.

> 🚧 **Project Status:** CODEXEDOC is currently in active development. APIs, features, and architecture may evolve as we work toward the first public release.

---

# Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Why CODEXEDOC?](#why-codexedoc)
* [Tech Stack](#tech-stack)
* [License](#license)
* [Open Source Philosophy](#open-source-philosophy)
* [Contributing Workflow](#contributing-workflow)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [New Contributors](#new-contributors)
  * [Core Contributors](#core-contributors)
* [Project Architecture](#project-architecture)
* [Database](#database)
* [Community](#community)
* [Documentation](#documentation)
* [Learn More](#learn-more)
* [Acknowledgements](#acknowledgements)

---

# Overview

CODEXEDOC is more than a flashcard app or note-taking tool.

It is a **Learning Operating System** that helps users organize, retain, and master knowledge through evidence-based learning methods.

Rather than replacing books, courses, videos, or teachers, CODEXEDOC provides the system that connects them together by helping users:

* Define learning goals
* Organize knowledge
* Practice active recall
* Schedule spaced repetition
* Build consistent learning habits
* Track long-term mastery

Whether you're learning a language, studying for an exam, becoming a software developer, or building professional skills, CODEXEDOC provides the framework that turns learning into a repeatable process.

---

## Features

- 🎯 Goal Management
- 🧠 Learning Blueprints
- 📝 Knowledge Items
- 🔁 Active Recall Engine
- 📅 Spaced Repetition
- ⏱️ Guided Learning Sessions
- 📖 Reflection Journal
- 🌳 Skill Trees
- 📊 Learning Analytics
- 🏆 Mastery Tracking

---

# Why CODEXEDOC?

Learning resources are everywhere—but staying organized, remembering what you've learned, and building lasting habits remain difficult.

CODEXEDOC brings proven learning techniques into a single platform so learners can focus on mastering knowledge instead of managing scattered notes and tools.

---

# Tech Stack

* **Framework:** Next.js + TypeScript
* **Database:** Drizzle ORM + Neon
* **Styling:** Tailwind CSS + Lucide Icons
* **Hosting:** GitHub + Vercel

---

# License

Copyright © 2026 CODEXEDOC

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-or-later).**

See the `LICENSE` file for the complete license text and terms.

---

# Open Source Philosophy

CODEXEDOC is proudly open source under the GNU Affero General Public License v3.0 (AGPL-3.0-or-later).

Our goal is to build the best Learning Operating System with the help of the community.

Everyone is welcome to:

* Report bugs
* Suggest improvements
* Submit pull requests
* Build new features
* Improve documentation

The AGPL ensures that improvements made to publicly hosted versions of CODEXEDOC remain open for the benefit of the entire community.

We believe knowledge should grow through collaboration while ensuring improvements remain available to everyone.

---

# Contributing Workflow

To help new contributors get familiar with the project while keeping development secure, CODEXEDOC uses a contributor progression.

### Mock Contributor

All new contributors begin as **Mock Contributors**.

At this stage you'll:

- Clone the `mock` branch
- Work on issues using a development environment that mirrors the production codebase without exposing sensitive credentials.
- Learn the project structure and contribution workflow

### Core Contributor

After consistently demonstrating quality contributions, you'll be promoted to **Core Contributor**.

Core Contributors:

- Clone from the `main` branch
- Receive the project's development environment keys
- Contribute directly to the production codebase

This workflow helps protect sensitive infrastructure while giving contributors a clear path to earning additional responsibility.

---

# Getting Started

## Prerequisites

Install:

* Node.js (v18+)
* Git

---

## New Contributors

If you're joining the project for the first time, you'll begin on the `mock` branch.

```bash
git clone https://github.com/codexedoc-com/codexedoc.git
cd codexedoc
git checkout mock

npm install

npm run dev
```

No environment keys are required.

Once you're promoted to Core Contributor, you'll receive the development environment configuration and begin working from `main`.

---

## Core Contributors

Core Contributors should clone the `main` branch.

```bash
git clone https://github.com/codexedoc-com/codexedoc.git
cd codexedoc
git checkout main
```

Create a `.env` file using the environment configuration provided by the maintainers.

```bash
npm install
npm run dev
```

---

# Project Architecture

The project is organized into a few core areas:

```text
app/
  Route handlers, pages, layouts, and styling

components/
  Reusable UI components

server/
  Server actions, database connection, schema, migrations, mutations, and queries

lib/
  Shared utilities and helper functions

public/
  Static assets
```

Supporting configuration files such as `package.json`, `tsconfig.json`, `drizzle.config.ts`, and `next.config.ts` live in the project root.

---

# Database

CODEXEDOC uses **Drizzle ORM** with **Neon** for data storage.

Database schemas are defined in:

```text
db/schema.ts
```

Whenever schema changes are made, generate and apply new migrations before deploying.

---

# Community

The CODEXEDOC community communicates primarily through Discord.

Join us to:

- Ask development questions
- Discuss new features
- Coordinate contributions
- Share ideas

GitHub Issues should be used for bug reports and feature requests. Before beginning work on an issue, post it in `#task-board` so the team knows you're working on it and duplicate effort is avoided.

---

## Documentation

- **CONTRIBUTING.md** — Contribution guidelines and development workflow.
- **CODE_OF_CONDUCT.md** — Community expectations and standards.
- **SECURITY.md** — How to responsibly report security vulnerabilities.

---

# Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

# Acknowledgements

CODEXEDOC exists thanks to every developer, designer, writer, educator, and learner who contributes to the project.

Every issue reported, pull request submitted, and discussion started helps make learning more accessible for everyone.

Thank you for helping build the future of learning.

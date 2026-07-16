# CODEXEDOC

![License](https://img.shields.io/github/license/codexedoc-com/codexedoc)
![Issues](https://img.shields.io/github/issues/codexedoc-com/codexedoc)
![Contributors](https://img.shields.io/github/contributors/codexedoc-com/codexedoc)
![Stars](https://img.shields.io/github/stars/codexedoc-com/codexedoc)

**CODEXEDOC** is a Learning Operating System designed to help people learn anything more effectively using proven learning science.

---

# Table of Contents

* [Overview](#overview)
* [Why CODEXEDOC?](#why-codexedoc)
* [Tech Stack](#tech-stack)
* [License](#license)
* [Getting Started](#getting-started)
  * [1. Prerequisites](#1-prerequisites)
  * [2. Clone & Setup](#2-clone--setup)
  * [3. Configure Environment](#3-configure-environment)
  * [4. Install Dependencies](#4-install-dependencies)
  * [5. Start Development Server](#5-start-development-server)
* [Project Architecture](#project-architecture)
* [Database](#database)
* [Community](#community)
* [Documentation](#Documentation)
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

- Learning goals
- Knowledge organization
- Active recall
- Spaced repetition
- Progress tracking
- Secure authentication
- Cross-device access

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

# Getting Started

## 1. Prerequisites

Install:

* Node.js (v18+)
* Git

---

## 2. Clone & Setup

Clone the repository:

```bash
git clone https://github.com/codexedoc-com/codexedoc.git
cd codexedoc
```

---

## 3. Configure Environment

Create a `.env` file using `.env.example`.

```env
DATABASE_URL=
RESEND_API_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
JWT_SECRET=
```

> Never commit your `.env` file or share production credentials.

---

## 4. Install Dependencies

```bash
npm install
```

---

## 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
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

GitHub Issues should be used for bug reports and feature requests.

---

## Documentation

- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md

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

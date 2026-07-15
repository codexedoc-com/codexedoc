# CODEXEDOC

**CODEXEDOC** is a Learning Operating System designed to help people learn anything more effectively using proven learning science.

---

# Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [License](#license)
- [Contributor Ruleset](#contributor-ruleset)
- [Getting Started](#getting-started)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Setup](#2-clone--setup)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Install Dependencies](#4-install-dependencies)
  - [5. Start Development Server](#5-start-development-server)
- [Project Structure](#project-structure)
- [Database](#database)
- [Application Versioning](#application-versioning)
- [Learn More](#learn-more)
- [Task Management](#task-management)
- [Project Admin](#project-admin)

---

# Overview

This platform is maintained by the **CodexEdoc** team, dedicated to providing quality technical documentation and educational content to empower learners worldwide.

---

# Tech Stack

- **Framework:** Next.js + TypeScript
- **Database:** Drizzle ORM + Neon
- **Styling:** Tailwind CSS + Lucide Icons
- **Hosting:** GitHub + Vercel

---

# License

Copyright © 2026 CODEXEDOC

CODEXEDOC is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-or-later).**

This means you are free to:

- Use the software
- Study the source code
- Modify the software
- Share copies
- Contribute improvements

Under the following conditions:

- Any distributed modifications must also be licensed under the AGPL.
- Copyright notices and license notices must be preserved.
- If you operate a modified version of CODEXEDOC as a network service (such as a website or SaaS), you must make the corresponding source code available to users of that service.
- This software is provided without warranty.

The full license text is available in the `LICENSE` file.

---

# Contributor Ruleset

All contributors to **Codexedoc** must adhere to the following rules to maintain code quality, consistency, and project stability.

## Code Quality Standards

- Write all application code in **TypeScript**.
- No JavaScript files in critical application logic.
- All code must pass ESLint before submission.

```bash
npm run lint
```

- Use strict TypeScript typing.
- Avoid `any` unless absolutely necessary and documented.
- Write tests for new features.
- Ensure existing tests pass before opening a PR.

---

## Branching & Commit Guidelines

### Branch Naming

```
user/<github_username>/<issue_number>
```

Example:

```text
user/glenniii-dev/42
```

### Commit Messages

```
[issue-number] Brief description
```

Example:

```text
[42] Add user authentication flow
```

### Pull Requests

- Link related issues.
- Include a detailed description.
- Request review before merging.

---

## File & Folder Standards

- Learn the existing project structure before creating new files.
- Component files use **PascalCase**.

```
UserCard.tsx
```

- Utility functions use **camelCase**.

```
getUserData.ts
```

- Folders use **kebab-case**.

```
user-components/
```

- Do not delete or restructure folders without Project Admin approval.

---

## Database Rules

- Modify schemas **only** in:

```
db/schema.ts
```

- Always use the development database.
- Never test against production.
- Contact the Project Admin before deleting:
  - Tables
  - Columns
  - Relationships

Always run:

```bash
npm run db:generate
npm run db:migrate
```

---

## Environment Variables

- Never commit `.env`
- Use `.env.example`
- Never share secrets
- Contact the Project Admin if values are needed

---

## Issue Management

- Only work on assigned issues.
- Keep issue status updated.
- Close completed issues.
- Contact the Project Admin for blockers.

---

## Documentation

- Update documentation whenever functionality changes.
- Comment complicated logic.
- Update this README when setup steps, dependencies, or features change.

---

## Code Reviews

- Every PR requires Project Admin approval.
- Address review comments promptly.
- Contributors may **not** merge their own PRs.

---

## Communication

- Ask questions when unsure.
- Report bugs immediately.
- Be respectful and constructive.

---

# Getting Started

## 1. Prerequisites

Install:

- Node.js (v18+)
- Git

If you experience issues, contact the Project Admin.

---

## 2. Clone & Setup

Clone the repository:

```bash
git clone https://github.com/codexedoc-com/codexedoc.git
cd codexedoc
```

Create your feature branch:

```bash
git checkout -b user/<github_username>/<issue_number>
```

Example:

```bash
git checkout -b user/glenniii-dev/42
```

---

## 3. Configure Environment

Create a `.env` file using `.env.example`.

```env
DATABASE_URL =
RESEND_API_KEY =
NEXT_PUBLIC_TURNSTILE_SITE_KEY =
TURNSTILE_SECRET_KEY =
JWT_SECRET =
```

> ⚠️ Never commit this file or share production credentials.

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

```
http://localhost:3000
```

---

# Project Structure

```text
codexedoc/
├── .next/
├── app/
│   ├── app/
│   ├── auth/
│   │   └── page.tsx
│   │
│   ├── create/
│   │   └── page.tsx
│   │ 
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.css
│   └── page.tsx
│
├── components/
├── lib/
│   ├── getCurrentUser.ts
│   └── setAuthCookie.ts
│ 
├── node_modules/
├── public/
├── app/
│   ├── actions/
│   │   └── auth/
│   │
│   ├── db/
│   │   ├── drizzle/
│   │   ├── db.ts
│   │   └── schema.ts
│   │
│   ├── mutations/
│   └── queries/
│
├── .env
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── drizzle.config.ts
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── README.md
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

---

# Database

If modifying the database schema, follow these steps carefully.

> ⚠️ Obtain the development database URL from the Project Admin first.

## Step 1 — Generate Baseline

If the `drizzle/` folder doesn't exist or is empty:

```bash
npm run db:generate
```

This creates the baseline snapshot.

---

## Step 2 — Modify Schema

Edit:

```
db/schema.ts
```

Allowed:

- Add tables
- Add columns
- Add relationships

Before deleting anything, contact the Project Admin.

---

## Step 3 — Generate Migration

```bash
npm run db:generate
```

Review the generated SQL before continuing.

---

## Step 4 — Apply Migration

Ensure `.env` points to the development database.

```bash
npm run db:migrate
```

If migration conflicts occur, consult the Drizzle documentation or request a temporary development database.

---

# Application Versioning

CODEXEDOC follows **Semantic Versioning**.

```
MAJOR.MINOR.PATCH
```

## Meaning

| Version | Purpose |
|---------|----------|
| MAJOR | Breaking changes |
| MINOR | New features |
| PATCH | Bug fixes |

---

## Lifecycle

### Development

- Feature branches
- Incomplete work allowed
- Frequently pull from `main`

### Staging

- Auto-deployed to Vercel
- QA
- Migration validation
- UI review

### Production

Released only after:

- PR approval
- Successful staging verification
- Migration review

---

## Release Tags

```bash
git tag v1.4.2
git push origin v1.4.2
```

---

## Contributor Responsibilities

- Increment **MINOR** for features
- Increment **PATCH** for bug fixes
- Discuss **MAJOR** versions with Project Admin
- Never create release tags
- Document version changes in PRs

### Examples

| Change | Version |
|---------|----------|
| New Feature | 1.2.0 → 1.3.0 |
| Bug Fix | 1.3.0 → 1.3.1 |
| Breaking Change | 1.3.1 → 2.0.0 |

---

# Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

# Task Management

As you complete work or platform features:

- Close GitHub issues assigned to you when complete
- Use GitHub Projects for task tracking and progress visualization
- Keep issue comments updated with your progress


---

# Project Admin

**Glenn**

**Reach out using either of the following methods:**
- **Email**: glenniii.dev@gmail.com
- **Discord**: glenniii.dev

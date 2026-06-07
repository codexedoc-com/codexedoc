# CodexEdoc

CodexEdoc is a comprehensive educational platform built to provide valuable resources, documentation, and collaborative content for learners and developers. Our mission is to empower the next generation through quality technical education and community-driven knowledge sharing.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Contributor Ruleset](#contributor-ruleset)
- [Getting Started](#getting-started)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Setup](#2-clone--setup)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Install Dependencies](#4-install-dependencies)
  - [5. Start Development Server](#5-start-development-server)
- [Project Structure](#project-structure)
- [Admin Access](#admin-access)
- [Learn More](#learn-more)
- [Task Management](#task-management)
- [Project Admin](#project-admin)
- [Credits](#credits)

---

## Overview

This platform is maintained by the CodexEdoc team, dedicated to providing quality technical documentation and educational content to empower learners worldwide.

---

## Tech Stack

- **Next.js + TypeScript** (Development)
- **Drizzle ORM + Neon** (Database)
- **Shadcn + Tailwind CSS** (Styling)
- **GitHub + Vercel** (Hosting)

---

## Contributor Ruleset

All contributors to CodexEdoc must adhere to the following rules to maintain code quality, consistency, and project stability:

### Code Quality Standards
- **Language**: Write all code in **TypeScript**. No JavaScript files in critical application logic.
- **Linting**: All code must pass ESLint checks before submission. Run `npm run lint` before committing.
- **Type Safety**: Ensure strict TypeScript types are used. No `any` types unless absolutely necessary and documented.
- **Testing**: Write tests for new features. Ensure existing tests pass before submitting a PR.

### Branching and Commit Guidelines
- **Branch Naming**: Follow the convention: `user/<github_username>/<issue_number>`
  - Example: `user/glenniii-dev/42`
- **Commit Messages**: Write clear, descriptive commit messages in the format:
  - `[issue-number] Brief description of changes`
  - Example: `[42] Add user authentication flow`
- **Pull Requests**: Link related issues and provide detailed descriptions of changes.

### File and Folder Standards
- **Familiarity Required**: Understand the project structure before creating new files or folders.
- **Naming Conventions**:
  - Use **PascalCase** for component files: `UserCard.tsx`
  - Use **camelCase** for utility functions: `getUserData.ts`
  - Use **kebab-case** for folder names: `user-components/`
- **No Unauthorized Modifications**: Do not restructure or delete existing folders/files without permission from the Project Admin.

### Database Rules
- **Schema Changes**: All database schema modifications must be made in `db/schema.ts` only.
- **Migration Process**: Follow the strict 4-step migration process documented in the Database section.
- **Development Database**: Always use the development database (`DATABASE_URL` in `.env`). Never test against production.
- **Approval Required**: Contact the Project Admin before deleting columns, tables, or relationships.
- **Generate Before Migrate**: Always run `npm run db:generate` before `npm run db:migrate`.

### Environment Variables
- **Never Commit `.env`**: The `.env` file must never be committed. Use `.env.example` as a template.
- **Credentials Confidential**: Never share or commit real database credentials, API keys, or secrets.
- **Request Missing Values**: If you need environment variable values, contact the Project Admin.

### Admin Access and Permissions
- **Request Only**: Admin credentials and access keys are provided only upon request.
- **Credentials from Admin**: Request user IDs, passwords, and API keys from the Project Admin.
- **Secure Handling**: Keep all credentials secure and do not share in public channels (GitHub, Discord, etc.).

### Issue Management
- **Assign Yourself**: Only work on issues assigned to you.
- **Update Status**: Keep issue status updated as you progress.
- **Close When Done**: Close issues when completed and all tests pass.
- **Contact Admin**: If you need reassignment or have blockers, reach out to the Project Admin.

### Documentation
- **Update Docs**: If your changes affect how the project works, update the relevant documentation.
- **Comment Complex Logic**: Add comments explaining complex or non-obvious code.
- **README Updates**: Update this README if adding new setup steps, dependencies, or features.

### Code Review Standards
- **Request Reviews**: Ensure at least one Project Admin reviews your PR before merging.
- **Address Feedback**: Address all code review comments promptly.
- **No Self-Merging**: Contributors may not merge their own pull requests.

### Communication
- **Ask Questions**: If anything is unclear, ask the Project Admin before proceeding.
- **Report Issues**: Report bugs, blockers, or stability concerns immediately.
- **Respectful Collaboration**: Maintain a respectful and constructive tone in all communications.

---

## Getting Started

### 1. Prerequisites

Ensure the following required tools are installed:

- [Node.js](https://nodejs.org/en/download/package-manager) (v18 or later recommended)
- [Git](https://git-scm.com/install/)

> If you run into issues, contact the [Project Admin](#project-admin).

### 2. Clone & Setup

```bash
git clone https://github.com/codexedoc-com/codexedoc.git
cd codexedoc
```

Create a branch with name following the convention:
```
user/<github_username>/<issue_number>
```

Example:
```bash
git checkout -b user/glenniii-dev/42
```

### 3. Configure Environment

Create a `.env` file in the root directory using `.env.example` as a template:

```
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_BASE_URL=
CF_R2_ACCESS_KEY_ID=
CF_R2_SECRET_ACCESS_KEY=
CF_R2_ENDPOINT=
CF_R2_BUCKET=
CF_R2_REGION=
```

⚠️ **Do NOT commit this file.** Never share real credentials in public spaces.

> If you run into issues, contact the [Project Admin](#project-admin).

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

---

## Project Structure

**Make sure you are familiar and understand the project structure before creating any new files or folders.**

> If you have questions or don't understand something, contact the [Project Admin](#project-admin).

```
codexedoc/
📂 ├── .next/                    # Next.js build cache (auto-generated)
📂 ├── app/                      # Next.js App Router (pages, layouts, API)
│  📂 ├── (root)/               # Shared layout for all pages
│  📂 ├── admin/                # Admin dashboard routes
│  📂 ├── api/                  # Server-side API routes
│  📄 └── layout.tsx            # Root layout
│
📂 ├── components/              # Reusable UI components
│  📂 ├── admin/                # Admin-specific components
│  📂 ├── cards/                # Card-style components
│  📂 ├── layout/               # Layout components (header, footer, sidebar)
│  📂 └── ui/                   # General UI primitives (buttons, inputs, modals)
│
📂 ├── db/                      # Database layer
│  📄 ├── db.ts                 # Database client / connection setup
│  📄 ├── migrate.ts            # Migration runner script
│  📄 └── schema.ts             # Table schemas and definitions
│
📂 ├── drizzle/                 # Drizzle ORM migration snapshots
│  📂 ├── meta/                 # Metadata snapshots
│  📄 └── *.sql                 # Generated migration files
│
📂 ├── lib/                     # Feature modules / library functions
│  📄 └── utils.ts              # Shared library utility functions
│
📂 ├── public/                  # Static assets (served as-is)
│  📄 ├── favicon.ico           # Browser favicon
│  📄 └── *.svg/*.png           # Image/icon assets
│
📂 ├── types/                   # Global TypeScript type definitions
│  📄 └── *.ts                  # Type definition files
│
📂 ├── utils/                   # General utility functions
│  📄 └── *.ts                  # Utility helper functions
│
📄 ├── .env                     # Local environment variables (do not commit)
📄 ├── .env.example             # Template for environment variables
📄 ├── .gitignore              # Git ignore rules
📄 ├── drizzle.config.ts        # Drizzle ORM configuration file
📄 ├── eslint.config.mjs        # ESLint configuration
📄 ├── globals.css              # Global styles (Tailwind, resets)
📄 ├── manifest.json            # PWA manifest file
📄 ├── next-env.d.ts            # Next.js TypeScript typings
📄 ├── next.config.ts           # Next.js configuration file
📂 ├── node_modules/            # Installed npm dependencies (auto-generated)
📄 ├── package.json             # Project metadata and npm scripts
📄 ├── package-lock.json        # npm lockfile (versioned dependencies)
📄 ├── postcss.config.mjs        # PostCSS configuration (Tailwind setup)
📄 ├── README.md                # Project documentation
📄 └── tsconfig.json            # TypeScript compiler options
```

---

## Database

If you are working on an issue and need to make changes to the database schema, follow these steps carefully. Missing any step or deviating from this process may have **adverse effects** on **application stability**.

⚠️ **Contact the [Project Admin](#project-admin) for the main Development Database URL before continuing.**

### STEP 1: Generate Baseline

If the `/drizzle` folder does not exist or is empty, run:

```bash
npm run db:generate
```

This is required to properly track changes made to the schema.

⚠️ **Warning**: If the drizzle folder is empty/non-existent and you make schema changes without generating first, it will treat your modified schema as the current database state and generate incorrect SQL files. These files are used in production, so be careful.

### STEP 2: Modify Schema

- Edit the code in `db/schema.ts`
- You are encouraged to add columns, relationships between tables, or new tables
- **Before deleting** a column, table, or relationship, **contact the Project Admin first** to discuss potential schema restructuring

### STEP 3: Generate Migration

After modifying `db/schema.ts`, run:

```bash
npm run db:generate
```

This command scans the schema for changes and compares it to the last generated snapshot. You can inspect the generated SQL file to verify your schema changes were correctly translated to SQL statements.

📌 **If unsatisfied with the generated SQL**, review your `schema.ts` file or consult the [Drizzle documentation](https://orm.drizzle.team/docs/schemas).

### STEP 4: Migrate Database

**Double-check `DATABASE_URL` in `.env` is set to the development database.**

```bash
npm run db:migrate
```

This applies the generated SQL migrations to the database. If errors occur, carefully review the error message and refer to the [Drizzle migration docs](https://orm.drizzle.team/docs/drizzle-kit-migrate).

📌 **Note**: Database changes may be overridden as multiple developers work with the same instance. If your work will take time and changes might be lost, request a temporary connection string from the [Project Admin](#project-admin).

---

## Admin Access

If your work involves admin access to the site, follow these steps:

1. Request a **user ID and PASSWORD** from the [Project Admin](#project-admin)
2. Visit `/admin` route locally or on the production site
3. Admin routes interact with API endpoints in `/app/api`

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Task Management

As you complete work or platform features:

- Close GitHub issues assigned to you when complete
- Use GitHub Projects for task tracking and progress visualization
- Keep issue comments updated with your progress

---

## Project Admin

### Glenn

**Reach out using either of the following methods:**
- **Email**: glenniii.dev@gmail.com
- **Discord**: glenniii.dev

---

## Cloudflare R2 Setup (Admin Uploads)

To enable file uploads (PDFs, images) to Cloudflare R2, add these environment variables to your `.env` file:

- `CF_R2_ACCESS_KEY_ID` — Your R2 access key ID
- `CF_R2_SECRET_ACCESS_KEY` — Your R2 secret access key
- `CF_R2_ENDPOINT` — R2 endpoint URL (e.g., `https://<account>.r2.cloudflarestorage.com`)
- `CF_R2_BUCKET` — The bucket name to use
- `CF_R2_REGION` — Optional region (default: `auto`)

The admin UI uploads files to `/api/admin/upload` and returns a public URL used by resource and content APIs.

---

## Credits

CodexEdoc is built and maintained by a collaborative team of educators, developers, and community members dedicated to advancing technical education worldwide.

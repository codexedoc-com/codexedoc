CODEXEDOC — Remaining Work (detailed)

Overview
========
This file lists the remaining work to finish CODEXEDOC according to the Product Specification. Items are grouped into epics, with clear subtasks, file/component hints, acceptance criteria, testing notes, and rough estimates. Complete items in priority order (High → Medium → Low).

Legend
------
- Priority: H/M/L
- Estimate: S (1-2h), M (half-day), L (1-2 days), XL (3+ days)
- Acceptance Criteria (AC) are testable results

Epic A — Goal System (H)
-------------------------
1. Goal creation: complete UX, validation, persist to DB
   - Tasks:
     - Make server action robust: validate input, sanitize title/description, enforce free/pro limits (if monetization is in scope) (file: server/queries/dashboardQueries.ts -> createGoalAction)
     - Add client-side validation in GoalCreationFlow (components/GoalCreationFlow.tsx)
     - Wire redirects to /app after create and show toast success/failure
   - AC: Creating a goal stores a row in `goals` with userId, title, dailyMinutes; user redirected to dashboard showing new goal
   - Est: M

2. Goal list & switching
   - Tasks:
     - Add a small Goals menu in header (app/app/page.tsx) to list and switch between user's goals (server: getUserGoals)
     - Implement `setActiveGoal` server action or client-side selection that updates current goal used by dashboard queries
     - Persist selected goal in session or DB (goals.active flag or user preference)
   - AC: User can switch goals, dashboard updates to show selected goal
   - Est: L

Epic B — Learning Blueprint (Areas) (H)
---------------------------------------
1. Learning areas CRUD
   - Tasks:
     - Ensure server action createLearningAreaAction returns created area id and validation (server/queries)
     - Implement update and delete actions: updateLearningAreaAction(goalId, areaId, newName), deleteLearningAreaAction(areaId)
     - Add client UI for editing/deleting a category in CategoriesSection (components/CategoriesSection.tsx)
   - Files: server/queries/dashboardQueries.ts, components/CategoriesSection.tsx
   - AC: Create, rename, and delete areas persist in DB and UI updates without full refresh
   - Est: L

Epic C — Knowledge System (Items) (H)
-------------------------------------
1. Items CRUD + tags/notes/difficulty
   - Tasks:
     - Expand createItemAction to accept notes and tags and return created item id
     - Implement updateItemAction(itemId, { fields }) and deleteItemAction(itemId)
     - Build Item detail view / modal (components/ItemDetailModal.tsx) with edit form and access to notes/tags
     - Add tag input UI and difficulty selector (1-5)
     - Ensure areaId validation and ownership checks on server
   - Files: server/queries/dashboardQueries.ts, components/AddItemForm.tsx (expand), new components/ItemDetailModal.tsx
   - AC: Items can be created/edited/deleted with notes/tags/difficulty; item list reflects changes
   - Est: XL

2. Bulk import / quick add
   - Tasks:
     - Add simple CSV / text import for batch items (server action parseImportAction)
     - Add "Quick Add" in dashboard for fast entry
   - AC: User can paste lines or upload CSV to add multiple items
   - Est: L

Epic D — Review System (Active Recall) (H)
------------------------------------------
1. Review UI flow (distraction-free)
   - Tasks:
     - Build Review session component with Reveal and grading buttons (Easy/Good/Hard/Forgot) (components/ReviewSession.tsx)
     - Server actions to record review results and update review record (lastReviewedAt, repetition, intervalDays, easeFactor)
     - Implement scheduling algorithm (see Spaced Repetition epic). Use basic SM-2 or simplified variant initially.
   - AC: Running a review updates review stats and schedules next review date
   - Est: XL

2. Review queue & pagination
   - Tasks:
     - Query reviews due (server: getReviewsDue(userId, goalId)) in dashboard queries
     - Add UI to view queue and jump to review session
   - AC: Reviews due count matches DB and opens the review session
   - Est: M

Epic E — Spaced Repetition Engine (H)
-------------------------------------
1. Baseline scheduler (SM-2 variant)
   - Tasks:
     - Implement scheduling logic for review result -> next scheduledAt calculation (server util)
     - Store easeFactor (scale 130–300), repetition, intervalDays
     - Add unit tests for scheduling rules
   - AC: Items progress through intervals roughly matching Day1→Day3→Day7... and adapt on Forgot/Hard
   - Est: L

2. Advanced: adaptivity and analytics hooks
   - Tasks:
     - Track history of review outcomes for each item
     - Adjust easeFactor based on graded feedback
   - Est: L

Epic F — Session System (H)
----------------------------
1. Session builder & runner
   - Tasks:
     - Implement Start Session flow in dashboard (startSession action creates studySessions row)
     - Break into Review / New / Practice / Reflect segments using time allocation strategies based on user's available minutes
     - Provide a timer and a progress UI for the active session
     - At session end, store reflections and session metrics
   - Files: server/queries, components/SessionBreakdown.tsx (extend), new components/ActiveSession.tsx
   - AC: Starting a session creates a session row, advances through segments, and saves reflections
   - Est: XL

Epic G — Reflection System (M)
------------------------------
1. Reflection capture and history
   - Tasks:
     - Create API to save reflections (server: createReflectionAction)
     - Add UI near session end to capture reflection fields and save
     - Add History view to review past reflections (components/ReflectionsList.tsx)
   - AC: Reflections saved and viewable in history
   - Est: M

Epic H — Mastery & Skill Tree (M)
---------------------------------
1. Mastery progression logic
   - Tasks:
     - Define rules mapping review history & retention to masteryLevel transitions (new→learning→familiar→strong→mastered)
     - Apply in review result handler to update item.masteryLevel
   - AC: Items transition states based on performance; Stats page reflects counts
   - Est: M

2. Skill tree generation
   - Tasks:
     - Compute tree from items and learningAreas; derive percentages per area and skill (server: getSkillTree)
     - Visual component improvements and interactions (expand/collapse, drill into area)
   - Est: L

Epic I — Analytics & Learning Operating Manual (M)
-------------------------------------------------
1. Core analytics
   - Tasks:
     - Implement server queries: retention rate, learning consistency, time invested, growth curves (server/queries)
     - Expose endpoints for chart data (e.g., daily items added, mastered per day)
     - Add front-end charts (Recharts) for key metrics in ProgressAnalytics and StatsOverview
   - AC: Charts reflect underlying DB data and match expected metrics
   - Est: L

2. Learning Operating Manual generation
   - Tasks:
     - Implement algorithm to compute best study time, session length, and most effective method after 30+ days
     - Create UI to view and export the manual (components/LearningManual.tsx)
   - AC: Manual generated when data threshold reached and matches specification
   - Est: XL

Epic J — Auth, Permissions & Demo Mode (H)
-------------------------------------------
1. Auth integration
   - Tasks:
     - Integrate real auth if not present (NextAuth or custom). Ensure server actions use session userId
     - Remove demo-user fallbacks for production builds
   - AC: Actions enforce user ownership; cannot access or modify other users' data
   - Est: XL

Epic K — Testing, Migrations, and Deployment (H)
-----------------------------------------------
1. DB migrations
   - Tasks:
     - Ensure Drizzle migrations cover all current schema changes
     - Add migration to change session table name conflict (if any)
   - Est: M

2. Tests
   - Tasks:
     - Unit tests for scheduling/srs logic
     - Integration tests for server actions (createGoalAction, createItemAction, createLearningAreaAction)
     - E2E tests for main flows: create goal → add area → add item → start session → run review
   - Est: XL

3. Deployment checklist
   - Tasks:
     - Configure environment variables for Neon/Postgres
     - Vercel production settings
     - Monitoring and error tracking
   - Est: M

Epic L — UX polish & Accessibility (M)
--------------------------------------
1. Visual parity with homepage
   - Tasks:
     - Confirm typography, spacing, colors, and components match homepage styles
     - Ensure mobile responsiveness for all dashboard components
   - AC: Visual check passes across common breakpoints
   - Est: M

2. Accessibility
   - Tasks:
     - Add aria labels, keyboard focus management, and semantic HTML
     - Run axe or similar and fix major issues
   - Est: M

Epic M — Monetization & Feature Flags (L)
-----------------------------------------
1. Free vs Pro gating
   - Tasks:
     - Implement feature flagging on server and UI
     - Gate advanced analytics and Learning Manual behind Pro flag
   - Est: L

Epic N — Social (Optional) (L)
------------------------------
1. Accountability features
   - Tasks:
     - Small-scale study groups, daily check-ins (limited to 10 users), basic leaderboards
   - Est: XL

Implementation notes and file map
---------------------------------
- Server: server/queries/dashboardQueries.ts, server/db/schema.ts
- Components (existing): components/TodayProgress.tsx, CategoriesSection.tsx, GoalCreationFlow.tsx, SessionBreakdown.tsx, SkillTree.tsx, StatsOverview.tsx, ProgressAnalytics.tsx, LearningInsights.tsx
- New components to add: ReviewSession.tsx, ItemDetailModal.tsx, ReflectionsList.tsx, ActiveSession.tsx, LearningManual.tsx
- DB migrations: add indices on reviews.scheduled_at, items.user_id, daily_progress.date

Testing & Acceptance
---------------------
- Create an automated test plan for each epic with example data and expected outcomes
- Manual QA checklist for visual and flow validation

Suggested next priorities (short-term roadmap)
----------------------------------------------
1. Finish Goal creation + goal switching (Epic A)
2. Areas CRUD + Add Item form (Epic B + C)
3. Review UI + basic scheduler (Epic D + E)
4. Session runner + reflections (Epic F + G)
5. Analytics and manual draft (Epic I)

If desired, tasks can be converted into repository issues/PRs. Ask to convert top N into issues, or to start implementing the highest priority task now.

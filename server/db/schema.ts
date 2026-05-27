import {
pgTable,
text,
timestamp,
uuid,
integer,
boolean,
varchar,
} from "drizzle-orm/pg-core";

/* =========================
USERS
========================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  username: varchar("username", { length: 50 }).notNull(),
  email: text("email").notNull().unique(),

  emailVerified: boolean("email_verified").default(false).notNull(),

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
SESSIONS
========================= */

export const authSessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  token: text("token").notNull().unique(),

  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
EMAIL VERIFICATION (OTP)
========================= */

export const verificationCodes = pgTable("verification_codes", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Email receiving the OTP
  email: text("email").notNull(),

  // Username being registered
  username: varchar("username", { length: 50 }).notNull(),

  // Hashed OTP code (never store raw code)
  codeHash: text("code_hash").notNull(),

  // Failed verification attempts
  attempts: integer("attempts").default(0).notNull(),

  // Number of times a code was sent
  sendCount: integer("send_count").default(1).notNull(),

  // Cooldown tracking
  lastSentAt: timestamp("last_sent_at", { mode: "date" })
    .defaultNow()
    .notNull(),

  // OTP expiration
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),

  // Creation timestamp
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

/* =========================
GOALS (CORE OS)
========================= */

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),

  description: text("description"),

  deadline: timestamp("deadline", { mode: "date" }),

  dailyMinutes: integer("daily_minutes").default(30),

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
LEARNING AREAS (BLUEPRINT)
========================= */

export const learningAreas = pgTable("learning_areas", {
  id: uuid("id").defaultRandom().primaryKey(),

  goalId: uuid("goal_id")
  .notNull()
  .references(() => goals.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
KNOWLEDGE ITEMS
========================= */

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  areaId: uuid("area_id")
  .references(() => learningAreas.id, { onDelete: "cascade" }),

  type: text("type").notNull(), // fact | vocab | concept | skill | procedure

  prompt: text("prompt").notNull(),

  answer: text("answer").notNull(),

  notes: text("notes"),

  difficulty: integer("difficulty").default(1), // 1-5

  masteryLevel: text("mastery_level").default("new"), // new | learning | familiar | strong | mastered

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
REVIEWS (SRS ENGINE)
========================= */

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),

  itemId: uuid("item_id")
  .notNull()
  .references(() => items.id, { onDelete: "cascade" }),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  scheduledAt: timestamp("scheduled_at", { mode: "date" }).notNull(),

  lastReviewedAt: timestamp("last_reviewed_at", { mode: "date" }),

  easeFactor: integer("ease_factor").default(250), // scaled (2.5 = 250)

  intervalDays: integer("interval_days").default(1),

  repetition: integer("repetition").default(0),

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
SESSIONS (DAILY LEARNING)
========================= */

export const studySessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  durationMinutes: integer("duration_minutes").notNull(),

  startedAt: timestamp("started_at", { mode: "date" })
  .defaultNow()
  .notNull(),

  endedAt: timestamp("ended_at", { mode: "date" }),
});

/* =========================
REFLECTIONS
========================= */

export const reflections = pgTable("reflections", {
  id: uuid("id").defaultRandom().primaryKey(),

  sessionId: uuid("session_id")
  .notNull()
  .references(() => studySessions.id, { onDelete: "cascade" }),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  learned: text("learned"),
  difficulty: text("difficulty"),
  confusion: text("confusion"),
  improvement: text("improvement"),
  focusTomorrow: text("focus_tomorrow"),

  createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),
});

/* =========================
DAILY PROGRESS
========================= */

export const dailyProgress = pgTable("daily_progress", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),

  date: timestamp("date", { mode: "date" }).notNull(),

  reviewsCompleted: integer("reviews_completed").default(0),

  newItemsAdded: integer("new_items_added").default(0),

  minutesStudied: integer("minutes_studied").default(0),
});

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Sparkles,
  BarChart3,
  Target,
  Layers3,
  Flame,
  BookOpen,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Active Recall Engine",
    description:
      "Learn by remembering, not consuming. Train long-term retention with structured recall.",
  },
  {
    icon: Clock3,
    title: "Spaced Repetition",
    description:
      "Review knowledge at scientifically optimized intervals for maximum mastery.",
  },
  {
    icon: Layers3,
    title: "Learning Blueprints",
    description:
      "Break massive goals into structured learning systems and manageable areas.",
  },
  {
    icon: Flame,
    title: "Consistency Tracking",
    description:
      "Build sustainable learning habits with streaks, analytics, and daily momentum.",
  },
  {
    icon: BarChart3,
    title: "Mastery Analytics",
    description:
      "Track retention, growth, weaknesses, and progress across every learning goal.",
  },
  {
    icon: Sparkles,
    title: "Personal Learning Manual",
    description:
      "Discover how YOU learn best with adaptive learning insights and performance data.",
  },
];

const goals = [
  "Mandarin Fluency",
  "React Mastery",
  "Security+ Certification",
  "Algebra Foundations",
  "Biology Fundamentals",
  "TypeScript Proficiency",
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#050816] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:70px_70px]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Image
                src="/codexedoc.png"
                alt="CODEXEDOC Logo"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wide">
                CODEXEDOC
              </h1>
              <p className="text-xs text-white/50">
                Learning Operating System
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-10 text-sm text-white/70 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#system" className="transition hover:text-white">
              System
            </a>
            <a href="#analytics" className="transition hover:text-white">
              Analytics
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="hidden text-sm text-white/70 transition hover:text-white md:block"
            >
              Login
            </Link>

            <Link
              href="/auth"
              className="group flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-20 px-6 py-20 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
              <Sparkles className="h-4 w-4" />
              The Learning Operating System
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Turn Goals
              <br />
              Into{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Mastery.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">
              CODEXEDOC helps you learn anything using active recall,
              spaced repetition, structured sessions, and long-term
              mastery systems.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/auth"
                className="group flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 font-semibold transition hover:bg-indigo-400"
              >
                Start Learning Free
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex flex-wrap gap-8">
              <div>
                <p className="text-3xl font-black">87%</p>
                <p className="mt-1 text-sm text-white/50">
                  Avg Retention Rate
                </p>
              </div>

              <div>
                <p className="text-3xl font-black">41 Days</p>
                <p className="mt-1 text-sm text-white/50">
                  Avg Learning Streak
                </p>
              </div>

              <div>
                <p className="text-3xl font-black">10x</p>
                <p className="mt-1 text-sm text-white/50">
                  More Consistency
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              {/* Dashboard Top */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">
                    Daily Dashboard
                  </p>
                  <h3 className="mt-1 text-2xl font-black">
                    Learn Mandarin
                  </h3>
                </div>

                <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-sm text-green-300">
                  17 Day Streak
                </div>
              </div>

              {/* Progress */}
              <div className="mt-8 space-y-5">
                {[
                  ["Speaking", "74%"],
                  ["Listening", "61%"],
                  ["Reading", "89%"],
                  ["Writing", "42%"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/70">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: value }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">
                    Reviews Due
                  </p>
                  <h4 className="mt-2 text-4xl font-black">24</h4>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">
                    Items Mastered
                  </p>
                  <h4 className="mt-2 text-4xl font-black">328</h4>
                </div>
              </div>

              {/* Session */}
              <div className="mt-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200/70">
                      Current Session
                    </p>
                    <h4 className="mt-1 text-xl font-bold">
                      30 Minute Focus Block
                    </h4>
                  </div>

                  <Target className="h-8 w-8 text-indigo-300" />
                </div>

                <div className="mt-5 grid grid-cols-4 gap-3 text-center text-sm">
                  <div>
                    <p className="font-bold">10m</p>
                    <p className="text-white/50">Review</p>
                  </div>

                  <div>
                    <p className="font-bold">10m</p>
                    <p className="text-white/50">New</p>
                  </div>

                  <div>
                    <p className="font-bold">5m</p>
                    <p className="text-white/50">Practice</p>
                  </div>

                  <div>
                    <p className="font-bold">5m</p>
                    <p className="text-white/50">Reflect</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 py-32">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black leading-tight sm:text-5xl"
          >
            Most People Don&apos;t Fail
            <br />
            Because They Can&apos;t Learn.
          </motion.h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/60">
            They fail because they don&apos;t have a system. Endless videos,
            unfinished courses, forgotten notes, and inconsistent
            studying lead nowhere.
          </p>

          <div className="mt-12 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 text-cyan-200">
            CODEXEDOC organizes the chaos.
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              FEATURES
            </p>

            <h2 className="text-4xl font-black sm:text-5xl">
              Everything You Need
              <br />
              To Learn Effectively
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-indigo-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-cyan-500/0 opacity-0 transition duration-500 group-hover:opacity-100 group-hover:from-indigo-500/10 group-hover:to-cyan-500/10" />

                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                      <Icon className="h-7 w-7 text-indigo-300" />
                    </div>

                    <h3 className="mt-6 text-2xl font-bold">
                      {feature.title}
                    </h3>

                    <p className="mt-4 leading-relaxed text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Flow */}
      <section
        id="system"
        className="relative z-10 py-32"
      >
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            THE SYSTEM
          </p>

          <h2 className="text-4xl font-black sm:text-5xl">
            A Structured Path
            <br />
            Toward Mastery
          </h2>

          <div className="mt-20 grid gap-6 md:grid-cols-5">
            {[
              "Goals",
              "Blueprints",
              "Knowledge",
              "Reviews",
              "Mastery",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-[28px] border border-white/10 bg-white/5 p-8"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-2xl font-black">
                  {index + 1}
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {item}
                </h3>

                {index !== 4 && (
                  <div className="absolute -right-3 top-1/2 hidden h-[2px] w-6 bg-gradient-to-r from-indigo-500 to-cyan-400 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built For Anything */}
      <section className="relative z-10 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              BUILT FOR ANYTHING
            </p>

            <h2 className="text-4xl font-black sm:text-5xl">
              Learn Any Skill.
              <br />
              Systematically.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => (
              <motion.div
                key={goal}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center justify-between rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:border-indigo-500/30 hover:bg-indigo-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-indigo-500/10 p-3">
                    <BookOpen className="h-6 w-6 text-indigo-300" />
                  </div>

                  <span className="text-lg font-semibold">
                    {goal}
                  </span>
                </div>

                <CheckCircle2 className="h-5 w-5 text-cyan-300 opacity-0 transition group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-40">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 p-12 backdrop-blur-2xl"
          >
            <h2 className="text-5xl font-black leading-tight sm:text-6xl">
              Stop Consuming.
              <br />
              Start Mastering.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              Build your personal learning system and make consistent
              progress toward mastery every single day.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth"
                className="group flex items-center gap-2 rounded-2xl bg-indigo-500 px-7 py-4 font-semibold transition hover:bg-indigo-400"
              >
                Create Your Learning System
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-lg font-black">
              CODEXEDOC
            </h3>

            <p className="mt-2 text-sm text-white/50">
              The Operating System For Learning
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/80">
            <a
              href="mailto:contact@codexedoc.com"
              className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10 hover:text-white"
            >
              contact@codexedoc.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
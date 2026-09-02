"use client";

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
  Zap,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Active Recall Engine",
    description:
      "Move beyond passive re-reading. Strengthen memory pathways through direct retrieval practice.",
  },
  {
    icon: Clock3,
    title: "SuperMemo-2 Spaced Repetition",
    description:
      "Algorithmic review schedules that surface cards right when you are on the verge of forgetting.",
  },
  {
    icon: Layers3,
    title: "Structured Blueprints",
    description:
      "Break complex domains into clear modules, vocabulary, rules, and fundamental principles.",
  },
  {
    icon: Flame,
    title: "Daily Habit Momentum",
    description:
      "Track streaks, daily review quotas, and study focus blocks designed for sustained consistency.",
  },
  {
    icon: BarChart3,
    title: "Mastery Analytics",
    description:
      "Real-time insight into card maturity, retention accuracy percentages, and topic breakdowns.",
  },
  {
    icon: Sparkles,
    title: "Offline-First & Fast",
    description:
      "Instant response times, clean distraction-free interface, and seamless local or cloud database support.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfd] text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-200">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900">CODEXEDOC</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Source Learning Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.1]">
            Turn Any Knowledge into <span className="text-indigo-600">Permanent Mastery</span>.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            A focused spaced repetition and active recall workspace. Organize your learning blueprint, review at optimal intervals, and retain what you learn for life.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-sm shadow-indigo-200 transition"
            >
              Start Learning for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-50 transition"
            >
              Sign In to Your Workspace
            </Link>
          </div>
        </motion.div>

        {/* Interactive App Preview Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 p-2 sm:p-3 rounded-2xl bg-zinc-100 border border-zinc-200/80 shadow-md max-w-3xl mx-auto text-left"
        >
          <div className="rounded-xl bg-white border border-zinc-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">System Design & Next.js Mastery</h3>
                  <p className="text-xs text-zinc-400">Daily Spaced Review • Card 4 of 12</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Streak: 14 Days
              </span>
            </div>

            <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Concept Flashcard</span>
              <p className="text-lg font-semibold text-zinc-900">
                What is the primary benefit of the SuperMemo-2 (SM-2) spaced repetition algorithm?
              </p>
              <p className="text-sm text-zinc-500 pt-1">
                → It dynamically scales interval intervals based on recall difficulty, maximizing retention efficiency with minimal daily study time.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">1: Again</div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">2: Hard</div>
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">3: Good</div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">4: Easy</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 sm:py-24 bg-zinc-50 border-t border-zinc-200/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Built on Cognitive Science Principles
            </h2>
            <p className="text-sm text-zinc-500">
              Designed to help developers, students, and professionals achieve deep fluency in complex domains.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200 px-4 sm:px-6 text-center text-xs text-zinc-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CODEXEDOC. Open Source under AGPL-3.0 License.</p>
          <div className="flex gap-4">
            <Link href="/auth" className="hover:text-zinc-600 transition">Get Started</Link>
            <Link href="/auth" className="hover:text-zinc-600 transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
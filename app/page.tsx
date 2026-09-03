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
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

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
  "Software Engineering",
  "Data Science",
  "Financial Markets",
  "Medical Terminology",
  "Mechanical Engineering",
];

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-zinc-200/80">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-200">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-900">CODEXEDOC</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
            <a href="#why" className="hover:text-zinc-900 transition">
              Why It Works
            </a>
            <a href="#features" className="hover:text-zinc-900 transition">
              Features
            </a>
            <a href="#system" className="hover:text-zinc-900 transition">
              The System
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition active:scale-[0.99]"
            >
              Start Learning
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              title="Toggle Menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navbar Menu */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 space-y-2 shadow-md">
            <a
              href="#why"
              onClick={() => setMobileNavOpen(false)}
              className="block py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
            >
              Why It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileNavOpen(false)}
              className="block py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
            >
              Features
            </a>
            <a
              href="#system"
              onClick={() => setMobileNavOpen(false)}
              className="block py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
            >
              The System
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-24 sm:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] sm:text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>THE OPERATING SYSTEM FOR LEARNING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-4xl mx-auto leading-[1.15] sm:leading-[1.1]">
            Turn Any Goal Into <span className="text-indigo-600">Structured Mastery</span>.
          </h1>

          <p className="text-sm sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            CODEXEDOC is a systematic learning platform combining Active Recall, Spaced Repetition, and Learning Blueprints to help you truly master complex skills.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <Link
              href="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-sm shadow-indigo-200 transition active:scale-[0.99]"
            >
              Create Your Learning System
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#system"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-50 transition"
            >
              Explore the System
            </a>
          </div>
        </motion.div>

        {/* Highlight Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left"
        >
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Active Recall</p>
              <p className="text-[11px] text-zinc-500">Learn by retrieving knowledge</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Spaced Repetition</p>
              <p className="text-[11px] text-zinc-500">Optimized memory retention</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Layers3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Skill Trees</p>
              <p className="text-[11px] text-zinc-500">Visual mastery tracking</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Codexedoc Section */}
      <section id="why" className="py-14 sm:py-24 bg-zinc-50 border-t border-zinc-200/80 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <p className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">
            WHY CODEXEDOC
          </p>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Most Learning Fails Not From Lack of Effort, But Lack of System.
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Random bookmarks, saved videos, half-read books, unfinished courses, forgotten notes, and inconsistent studying lead nowhere.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2 text-xs sm:text-sm font-semibold text-indigo-700">
              CODEXEDOC organizes the chaos.
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 sm:py-24 bg-white border-t border-zinc-200/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase mb-2">
              FEATURES
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Everything You Need<br />To Learn Effectively
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mb-1.5">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The System Section */}
      <section id="system" className="py-14 sm:py-24 bg-zinc-50 border-t border-zinc-200/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-10 sm:space-y-14">
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">
              THE SYSTEM
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              A Structured Path Toward Mastery
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {["Goals", "Blueprints", "Knowledge", "Reviews", "Mastery"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs text-center"
              >
                <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm sm:text-base mb-3 shadow-xs shadow-indigo-200">
                  {index + 1}
                </div>
                <h3 className="font-bold text-sm sm:text-base text-zinc-900">{item}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built For Anything */}
      <section className="py-14 sm:py-24 bg-white border-t border-zinc-200/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">
              BUILT FOR ANYTHING
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Learn Any Skill. Systematically.
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {goals.map((goal, index) => (
              <motion.div
                key={goal}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-indigo-300 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{goal}</span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-zinc-50 border-t border-zinc-200/80 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 sm:p-14 rounded-3xl bg-white border border-zinc-200/80 shadow-md space-y-4 sm:space-y-6"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Stop Consuming.<br /><span className="text-indigo-600">Start Mastering.</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
              Build your personal learning system and make consistent progress toward mastery every single day.
            </p>

            <div className="pt-2">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 sm:px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition active:scale-[0.99]"
              >
                Create Your Learning System
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200 bg-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">CODEXEDOC</h3>
            <p className="text-xs text-zinc-500 mt-0.5">The Operating System For Learning</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <a
              href="mailto:contact@codexedoc.com"
              className="hover:text-zinc-900 transition"
            >
              contact@codexedoc.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
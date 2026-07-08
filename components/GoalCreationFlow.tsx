"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { createGoalAction } from "@/server/mutations/appMutations";

interface GoalCreationFlowProps {
  onClose?: () => void;
  onGoalCreated?: () => void;
  userId: string;
}

export function GoalCreationFlow({ onClose, onGoalCreated, userId }: GoalCreationFlowProps) {
  const [step, setStep] = useState<"title" | "why" | "timeline" | "time">("title");
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    why: "",
    timeline: "",
    dailyMinutes: "",
  });

  const handleNext = () => {
    const steps = ["title", "why", "timeline", "time"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1] as any);
    }
  };

  const handleBack = () => {
    const steps = ["title", "why", "timeline", "time"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as any);
    }
  };

  const handleCreate = async () => {
    startTransition(async () => {
      try {
        // Require userId to be present. If missing, abort create and log error.
        if (!userId) {
          console.error("GoalCreationFlow: missing userId; cannot create goal.");
          return;
        }

        const result = await createGoalAction(userId, {
          title: formData.title,
          dailyMinutes: parseInt(formData.dailyMinutes.match(/\d+/)?.[0] || "30"),
          deadline: undefined,
        });

        if (result?.success) {
          onGoalCreated?.();
        } else {
          console.error("Failed to create goal:", result?.error);
        }
      } catch (error) {
        console.error("Failed to create goal:", error);
      }
    });
  };

  const whyOptions = ["Travel", "Career", "School", "Hobby", "Other"];
  const timelineOptions = ["No deadline", "3 months", "6 months", "1 year"];
  const dailyTimeOptions = ["15 minutes", "30 minutes", "1 hour", "2+ hours"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-200">
              <Sparkles className="h-3 w-3" />
              Create Your Learning Goal
            </div>
            <h2 className="text-3xl font-black">
              {step === "title" && "What would you like to learn?"}
              {step === "why" && "Why are you learning this?"}
              {step === "timeline" && "When would you like to reach this goal?"}
              {step === "time" && "How much time can you study daily?"}
            </h2>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Title */}
            {step === "title" && (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <input
                  type="text"
                  placeholder="e.g., Learn Mandarin Chinese, Master React, Pass Security+ Exam"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg text-white placeholder-white/40 focus:border-indigo-500/30 focus:outline-none transition"
                  autoFocus
                />
                <p className="text-sm text-white/60">
                  Be specific and clear about your learning goal. This will guide your entire learning system.
                </p>
              </motion.div>
            )}

            {/* Step 2: Why */}
            {step === "why" && (
              <motion.div
                key="why"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {whyOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, why: option })}
                    className={`rounded-2xl border-2 p-4 text-left font-semibold transition ${
                      formData.why === option
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 3: Timeline */}
            {step === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {timelineOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, timeline: option })}
                    className={`rounded-2xl border-2 p-4 text-left font-semibold transition ${
                      formData.timeline === option
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 4: Daily Time */}
            {step === "time" && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {dailyTimeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, dailyMinutes: option })}
                    className={`rounded-2xl border-2 p-4 text-left font-semibold transition ${
                      formData.dailyMinutes === option
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Actions */}
        <div className="flex items-center justify-between border-t border-white/10 p-8">
          <button
            onClick={step === "title" ? onClose : handleBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === "title" ? "Cancel" : "Back"}
          </button>

          <div className="flex gap-3">
            {step !== "time" && (
              <button
                onClick={handleNext}
                disabled={
                  (step === "title" && !formData.title) ||
                  (step === "why" && !formData.why) ||
                  (step === "timeline" && !formData.timeline)
                }
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:border-white/30 hover:bg-white/10 transition disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === "time" && (
              <button
                onClick={handleCreate}
                disabled={!formData.dailyMinutes || pending}
                className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-3 font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-50"
              >
                {pending ? "Creating..." : "Create Goal"}
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

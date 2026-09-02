"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Target, Clock, Calendar, Compass, Check } from "lucide-react";
import { createGoalAction, createLearningAreaAction } from "@/server/mutations/appMutations";

type Step = "title" | "why" | "timeline" | "time";

interface GoalCreationFlowProps {
  onClose?: () => void;
  onGoalCreated?: () => void;
  userId: string;
}

const PRESET_GOALS = [
  "Master React & TypeScript",
  "Conversational Spanish",
  "System Design & Architecture",
  "AWS Cloud Practitioner",
  "Data Structures & Algorithms",
];

export function GoalCreationFlow({ onClose, onGoalCreated, userId }: GoalCreationFlowProps) {
  const [step, setStep] = useState<Step>("title");
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    why: "",
    timeline: "",
    dailyMinutes: "30",
  });

  const steps: Step[] = ["title", "why", "timeline", "time"];
  const currentStepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const handleCreate = async () => {
    startTransition(async () => {
      try {
        if (!userId) return;

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

  const whyOptions = [
    { label: "Career Advancement", desc: "For new jobs, promotions, or interview prep" },
    { label: "Personal Curiosity", desc: "Exploring a new skill or fascinating topic" },
    { label: "School / Exam", desc: "Passing an exam or academic course" },
    { label: "Travel & Practical Use", desc: "Applying it in real world day-to-day situations" },
  ];

  const timelineOptions = [
    { label: "1 Month", desc: "High intensity sprint" },
    { label: "3 Months", desc: "Consistent focused learning" },
    { label: "6 Months", desc: "Deep mastery over time" },
    { label: "No Deadline", desc: "Self-paced continuous learning" },
  ];

  const dailyTimeOptions = [
    { label: "15 minutes", desc: "Quick daily habit" },
    { label: "30 minutes", desc: "Recommended balance" },
    { label: "45 minutes", desc: "Accelerated pace" },
    { label: "60+ minutes", desc: "Intense daily focus" },
  ];

  return (
    <div className="w-full max-w-2xl bg-white border border-zinc-200/80 rounded-2xl shadow-sm p-6 sm:p-10">
      {/* Step Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
          <span className="uppercase tracking-wider">Step {currentStepIndex + 1} of 4</span>
          <span>{Math.round(((currentStepIndex + 1) / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Heading */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Goal Blueprint Setup</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          {step === "title" && "What do you want to learn?"}
          {step === "why" && "What is your main motivation?"}
          {step === "timeline" && "What is your target timeline?"}
          {step === "time" && "How much time can you commit daily?"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {step === "title" && "Define your primary learning goal. You can add topics and flashcards inside it."}
          {step === "why" && "Understanding your motivation helps calibrate review schedules."}
          {step === "timeline" && "Set a target date to organize your spaced repetition cadence."}
          {step === "time" && "Daily consistency is key to long-term memory consolidation."}
        </p>
      </div>

      {/* Step Content */}
      <div className="min-h-[240px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Goal Title */}
          {step === "title" && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="e.g. Master React & TypeScript, Conversational Spanish..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
                autoFocus
              />

              <div>
                <p className="text-xs font-medium text-zinc-500 mb-2">Popular suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_GOALS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, title: preset })}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Motivation */}
          {step === "why" && (
            <motion.div
              key="why"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {whyOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, why: option.label })}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    formData.why === option.label
                      ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-semibold text-sm text-zinc-900">{option.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 3: Timeline */}
          {step === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {timelineOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeline: option.label })}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    formData.timeline === option.label
                      ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-semibold text-sm text-zinc-900">{option.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 4: Daily Minutes */}
          {step === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {dailyTimeOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, dailyMinutes: option.label })}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    formData.dailyMinutes === option.label
                      ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-semibold text-sm text-zinc-900">{option.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
        <button
          type="button"
          onClick={step === "title" ? onClose : handleBack}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === "title" ? "Cancel" : "Back"}
        </button>

        {step !== "time" ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === "title" && !formData.title.trim()) ||
              (step === "why" && !formData.why) ||
              (step === "timeline" && !formData.timeline)
            }
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 transition cursor-pointer"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            disabled={pending || !formData.dailyMinutes}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 transition cursor-pointer"
          >
            {pending ? "Creating Goal..." : "Finish & Open Dashboard"}
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

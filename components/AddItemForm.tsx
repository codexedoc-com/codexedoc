"use client";

import { useState } from "react";
import { X, Sparkles, Plus, BookOpen, Layers } from "lucide-react";
import { createItemAction } from "@/server/mutations/appMutations";

interface Category {
  id: string;
  name: string;
}

interface Props {
  userId?: string | null;
  categories: Category[];
  initialCategoryId?: string;
  onClose?: () => void;
  onCreated?: () => void;
}

export default function AddItemForm({
  userId,
  categories,
  initialCategoryId,
  onClose,
  onCreated,
}: Props) {
  const [areaId, setAreaId] = useState(initialCategoryId || categories?.[0]?.id || "");
  const [type, setType] = useState("vocab");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);

  const handleCreate = async () => {
    if (!userId || !areaId || !prompt.trim() || !answer.trim()) return;
    setPending(true);
    try {
      const result = await createItemAction(userId, { areaId, type, prompt, answer });
      if (result?.success) {
        onCreated?.();
      } else {
        console.error("Failed to create item:", result?.error);
      }
    } catch (e) {
      console.error(e);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-xl max-h-[95dvh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 truncate">Add Knowledge Card</h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 truncate">Create a card for active spaced review.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition cursor-pointer flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Topic / Category
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Card Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              >
                <option value="vocab">Vocabulary</option>
                <option value="concept">Concept</option>
                <option value="fact">Fact / Trivia</option>
                <option value="procedure">Formula / Rule</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Front Prompt (Question)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., What is useEffect in React used for?"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Back Answer (Solution / Meaning)
            </label>
            <textarea
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g., For handling side effects like data fetching, subscriptions, and timers."
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!userId || !areaId || !prompt.trim() || !answer.trim() || pending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer shadow-xs text-center"
          >
            {pending ? "Adding..." : "Add to Review Queue"}
          </button>
        </div>
      </div>
    </div>
  );
}

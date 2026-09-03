"use client";

import { useState } from "react";
import { X, Sparkles, FolderPlus } from "lucide-react";
import { createLearningAreaAction } from "@/server/mutations/appMutations";

interface Props {
  goalId: string;
  onClose?: () => void;
  onCreated?: () => void;
}

export default function CreateCategoryModal({ goalId, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setPending(true);
    try {
      const result = await createLearningAreaAction(goalId, name.trim());
      if (result?.success) {
        onCreated?.();
      } else {
        console.error("Failed to create category:", result?.error);
      }
    } catch (e) {
      console.error(e);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 truncate">New Learning Topic</h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 truncate">Group your cards into structured modules.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition cursor-pointer flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 sm:mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Topic Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hooks & Lifecycle, Grammar Basics..."
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
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
            disabled={!name.trim() || pending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer shadow-xs text-center"
          >
            {pending ? "Creating..." : "Create Topic"}
          </button>
        </div>
      </div>
    </div>
  );
}

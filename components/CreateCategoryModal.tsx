"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
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
    if (!name) return;
    setPending(true);
    try {
      const result = await createLearningAreaAction(goalId, name);
      if (result?.success) {
        onCreated?.();
      } else {
        const errorMessage = result && "error" in result ? result.error : undefined;
        console.error("Failed to create category:", errorMessage);
      }
    } catch (e) {
      console.error(e);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">
              <Sparkles className="h-3 w-3" /> Create Category
            </div>
            <h3 className="text-2xl font-black">New Category</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="mt-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Introductions"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:outline-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl bg-white/5 px-4 py-2 font-semibold">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!name || pending}
            className="rounded-2xl bg-indigo-500 px-4 py-2 font-semibold disabled:opacity-50"
          >
            {pending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

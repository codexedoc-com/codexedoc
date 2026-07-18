"use client";

import { useState } from "react";
import { createItemAction } from "@/server/mutations/appMutations";

interface Category {
  id: string;
  name: string;
}

interface Props {
  userId?: string | null;
  categories: Category[];
  onClose?: () => void;
  onCreated?: () => void;
}

export default function AddItemForm({ userId, categories, onClose, onCreated }: Props) {
  const [areaId, setAreaId] = useState(categories?.[0]?.id || "");
  const [type, setType] = useState("vocab");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);

  const handleCreate = async () => {
    if (!userId || !areaId || !prompt || !answer) return;
    setPending(true);
    try {
      const result = await createItemAction(userId, { areaId, type, prompt, answer });
      if (result?.success) {
        onCreated?.();
      } else {
        const errorMessage = result && "error" in result ? result.error : undefined;
        console.error("Failed to create item:", errorMessage);
      }
    } catch (e) {
      console.error(e);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-2xl font-black">Add Knowledge Item</h3>
            <p className="mt-1 text-xs sm:text-sm text-white/60">Create a new item and schedule it for review.</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white flex-shrink-0">✕</button>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white">
            <option value="vocab">Vocabulary</option>
            <option value="phrase">Phrase</option>
            <option value="fact">Fact</option>
            <option value="concept">Concept</option>
          </select>
        </div>

        <div className="mt-3 sm:mt-4">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt (question)" className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-white/40" />
        </div>

        <div className="mt-3 sm:mt-4">
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer" className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-white/40" />
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
          <button onClick={onClose} className="rounded-2xl bg-white/5 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold hover:bg-white/10 transition">Cancel</button>
          <button onClick={handleCreate} disabled={!userId || !areaId || !prompt || !answer || pending} className="rounded-2xl bg-indigo-500 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold hover:bg-indigo-400 disabled:opacity-50 transition">
            {pending ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

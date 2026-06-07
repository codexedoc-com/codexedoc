"use client";

import { useState } from "react";
import { createItemAction } from "@/server/queries/dashboardQueries";

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
        console.error("Failed to create item:", result?.error);
      }
    } catch (e) {
      console.error(e);
    }
    setPending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Add Knowledge Item</h3>
            <p className="text-sm text-white/60">Create a new item and schedule it for review.</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
            <option value="vocab">Vocabulary</option>
            <option value="phrase">Phrase</option>
            <option value="fact">Fact</option>
            <option value="concept">Concept</option>
          </select>
        </div>

        <div className="mt-4">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt (question)" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
        </div>

        <div className="mt-4">
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl bg-white/5 px-4 py-2 font-semibold">Cancel</button>
          <button onClick={handleCreate} disabled={!userId || !areaId || !prompt || !answer || pending} className="rounded-2xl bg-indigo-500 px-4 py-2 font-semibold disabled:opacity-50">
            {pending ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

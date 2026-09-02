"use client";

import { Folder, Plus, ArrowRight, BookOpen, Layers } from "lucide-react";

interface CategoriesProps {
  categories: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
  onCreateCategory?: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export function CategoriesSection({
  categories,
  onCreateCategory,
  onSelectCategory,
}: CategoriesProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Learning Blueprint Topics</h3>
          <p className="text-xs text-zinc-500">Modules and flashcards for your current goal.</p>
        </div>

        {onCreateCategory && (
          <button
            onClick={onCreateCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Topic
          </button>
        )}
      </div>

      {/* Grid */}
      {categories.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onSelectCategory?.(category.id)}
              className="group p-4 rounded-2xl border border-zinc-200/80 bg-white hover:border-indigo-300 hover:shadow-xs transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Folder className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 group-hover:text-indigo-600 transition">
                    {category.name}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {category.itemCount} {category.itemCount === 1 ? "card" : "cards"}
                  </p>
                </div>
              </div>

              <div className="text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
          <Layers className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
          <p className="text-sm font-semibold text-zinc-700">No categories created yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Group your study materials into topics like Vocabulary, Rules, or Key Concepts.
          </p>
          {onCreateCategory && (
            <button
              onClick={onCreateCategory}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}

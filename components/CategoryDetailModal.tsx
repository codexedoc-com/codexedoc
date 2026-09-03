"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Brain,
  Sparkles,
  Layers,
  ArrowRight,
  Folder,
} from "lucide-react";
import {
  getCategoryDetailAction,
  deleteCategoryAction,
  deleteItemAction,
  CategoryDetail,
} from "@/server/actions/categoryActions";

interface CategoryDetailModalProps {
  categoryId: string;
  onClose: () => void;
  onAddItem: (categoryId: string) => void;
  onStartCategoryPractice: (categoryId: string, categoryName: string) => void;
  onCategoryDeleted: () => void;
}

export function CategoryDetailModal({
  categoryId,
  onClose,
  onAddItem,
  onStartCategoryPractice,
  onCategoryDeleted,
}: CategoryDetailModalProps) {
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingCat, setDeletingCat] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getCategoryDetailAction(categoryId);
    setDetail(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this knowledge item?")) return;
    await deleteItemAction(itemId);
    loadData();
  };

  const handleDeleteCategory = async () => {
    if (!confirm("Delete this category and all items inside it?")) return;
    setDeletingCat(true);
    await deleteCategoryAction(categoryId);
    setDeletingCat(false);
    onCategoryDeleted();
  };

  const getMasteryBadge = (level?: string | null) => {
    switch (level) {
      case "mastered":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Mastered</span>;
      case "strong":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Strong</span>;
      case "familiar":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Familiar</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">Learning</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 truncate">{detail?.name || "Topic Details"}</h3>
              <p className="text-[11px] sm:text-xs text-zinc-500">
                {detail?.items?.length || 0} {detail?.items?.length === 1 ? "knowledge card" : "knowledge cards"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddItem(categoryId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Card
            </button>
            {detail && detail.items.length > 0 && (
              <button
                onClick={() => onStartCategoryPractice(categoryId, detail.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer active:scale-[0.99]"
              >
                <Brain className="h-3.5 w-3.5 text-indigo-600" />
                Practice Topic
              </button>
            )}
          </div>

          <button
            onClick={handleDeleteCategory}
            disabled={deletingCat}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition cursor-pointer p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Topic
          </button>
        </div>

        {/* Items List */}
        <div className="p-3.5 sm:p-6 flex-1 overflow-y-auto space-y-2.5 sm:space-y-3">
          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">Loading items...</div>
          ) : !detail?.items || detail.items.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="mx-auto h-10 w-10 text-zinc-300 mb-2" />
              <p className="text-sm font-semibold text-zinc-700">No cards in this topic yet</p>
              <p className="text-xs text-zinc-400 mt-1">Add flashcards, vocab words, or concepts to start studying.</p>
              <button
                onClick={() => onAddItem(categoryId)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Card
              </button>
            </div>
          ) : (
            detail.items.map((item) => (
              <div
                key={item.id}
                className="group p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 transition flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {item.type}
                    </span>
                    {getMasteryBadge(item.masteryLevel)}
                  </div>
                  <p className="font-semibold text-xs sm:text-sm text-zinc-900 break-words">{item.prompt}</p>
                  <p className="text-xs text-zinc-500 pt-0.5 break-words">{item.answer}</p>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-zinc-400 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-600 p-1.5 rounded-lg hover:bg-zinc-50 transition cursor-pointer flex-shrink-0"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

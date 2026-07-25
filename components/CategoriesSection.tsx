"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, ChevronDown, Star } from "lucide-react";

interface Item {
  id: string;
  areaId: string;
  type: string;
  prompt: string;
  answer: string;
  difficulty?: number;
  notes?: string;
  tags?: string[];
  masteryLevel?: string;
}

interface CategoriesProps {
  categories: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
  items?: Item[];
  onCreateCategory?: () => void;
  onSelectItem?: (item: Item) => void;
}

export function CategoriesSection({
  categories,
  items = [],
  onCreateCategory,
  onSelectItem,
}: CategoriesProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-white/50">Learning Blueprint</p>
          <h3 className="mt-1 text-lg sm:text-2xl font-black">Categories & Knowledge Items</h3>
        </div>
        {onCreateCategory && (
          <button
            onClick={onCreateCategory}
            className="flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20 transition"
          >
            <Plus className="h-4 w-4" />
            Create Category
          </button>
        )}
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="space-y-3">
          {categories.map((category, index) => {
            const categoryItems = items.filter((item) => item.areaId === category.id);
            const isExpanded = expandedCategoryId === category.id;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition"
              >
                {/* Category Header Row */}
                <div
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl sm:rounded-2xl bg-indigo-500/10 p-2.5 sm:p-3">
                      <Folder className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-white">{category.name}</h4>
                      <p className="mt-1 text-xs sm:text-sm text-white/50">
                        {categoryItems.length || category.itemCount} {categoryItems.length === 1 ? "card" : "cards"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white/40">
                    <span className="text-xs hidden sm:inline">Click to view cards</span>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Collapsible Items List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 bg-black/20 p-4 sm:p-6 space-y-3"
                    >
                      {categoryItems.length > 0 ? (
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                          {categoryItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectItem?.(item);
                              }}
                              className="group rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-indigo-500/40 hover:bg-white/10 cursor-pointer transition space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase">
                                  {item.type}
                                </span>
                                <div className="flex items-center gap-1 text-amber-400 text-xs">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  <span>{item.difficulty || 1}★</span>
                                </div>
                              </div>

                              <p className="font-medium text-sm text-white group-hover:text-indigo-200 transition line-clamp-2">
                                {item.prompt}
                              </p>

                              <p className="text-xs text-white/50 truncate">
                                Answer: {item.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-white/40 text-xs sm:text-sm">
                          No cards in this category yet. Click &quot;Add Knowledge&quot; to create one!
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-12 text-center backdrop-blur-xl"
        >
          <Folder className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-white/30 mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-white/60">No categories yet. Create one to start organizing your learning.</p>
          {onCreateCategory && (
            <button
              onClick={onCreateCategory}
              className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-indigo-400 transition"
            >
              <Plus className="h-4 w-4" />
              Create Your First Category
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Folder, Plus } from "lucide-react";

interface CategoriesProps {
  categories: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
  onCreateCategory?: () => void;
}

export function CategoriesSection({ categories, onCreateCategory }: CategoriesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Learning Blueprint</p>
          <h3 className="mt-1 text-2xl font-black">Categories</h3>
        </div>
        {onCreateCategory && (
          <button
            onClick={onCreateCategory}
            className="flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20 transition"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        )}
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-indigo-500/30 hover:bg-white/8 cursor-pointer transition transform hover:scale-105"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-indigo-500/10 p-3">
                    <Folder className="h-6 w-6 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{category.name}</h4>
                    <p className="mt-1 text-sm text-white/50">
                      {category.itemCount} {category.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl"
        >
          <Folder className="mx-auto h-12 w-12 text-white/30 mb-4" />
          <p className="text-white/60">No categories yet. Create one to start organizing your learning.</p>
          {onCreateCategory && (
            <button
              onClick={onCreateCategory}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 transition"
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

"use client";

import { Brain, Sparkles, CheckCircle2, ChevronRight, Layers } from "lucide-react";

interface SkillNode {
  name: string;
  percentage: number;
  children?: SkillNode[];
}

interface SkillTreeProps {
  treeData?: SkillNode;
}

export function SkillTree({ treeData }: SkillTreeProps) {
  const root = treeData || {
    name: "Overall Learning",
    percentage: 0,
    children: [],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Topic Mastery Breakdown</h3>
          <p className="text-xs text-zinc-500">Calculated from your spaced repetition reviews.</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-indigo-600">{root.percentage}% Mastery</span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Overall Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1.5">
            <span>Overall Goal Mastery</span>
            <span>{root.percentage}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${root.percentage}%` }}
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="divide-y divide-zinc-100 pt-2">
          {root.children && root.children.length > 0 ? (
            root.children.map((child) => (
              <div key={child.name} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 flex-shrink-0 text-xs">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{child.name}</p>
                    {child.children?.[0]?.name && (
                      <p className="text-[11px] text-zinc-400 truncate">{child.children[0].name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${child.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-700 w-9 text-right">
                    {child.percentage}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400 py-4 text-center">
              Add knowledge items and complete reviews to build your mastery tree.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

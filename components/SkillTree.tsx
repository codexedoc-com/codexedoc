"use client";

import { motion } from "framer-motion";
import { Target, BookOpen, Volume2, PenTool } from "lucide-react";

interface SkillNode {
  name: string;
  percentage: number;
  children?: SkillNode[];
}

const skillTreeData: SkillNode = {
  name: "Overall Learning",
  percentage: 45,
  children: [
    {
      name: "Speaking",
      percentage: 63,
      children: [
        { name: "Introductions", percentage: 100 },
        { name: "Questions", percentage: 75 },
        { name: "Opinions", percentage: 20 },
      ],
    },
    { name: "Listening", percentage: 45 },
    { name: "Reading", percentage: 30 },
    { name: "Writing", percentage: 15 },
  ],
};

interface SkillItemProps {
  skill: SkillNode;
  depth: number;
}

function SkillItem({ skill, depth }: SkillItemProps) {
  const getIcon = (name: string) => {
    if (name.includes("Speaking")) return <BookOpen className="h-5 w-5" />;
    if (name.includes("Listening")) return <Volume2 className="h-5 w-5" />;
    if (name.includes("Reading")) return <BookOpen className="h-5 w-5" />;
    if (name.includes("Writing")) return <PenTool className="h-5 w-5" />;
    return <Target className="h-5 w-5" />;
  };

  const bgColors = [
    "bg-indigo-500/10",
    "bg-cyan-500/10",
    "bg-purple-500/10",
  ];
  const borderColors = [
    "border-indigo-500/30",
    "border-cyan-500/30",
    "border-purple-500/30",
  ];

  const bgColor = bgColors[depth % bgColors.length];
  const borderColor = borderColors[depth % borderColors.length];
  const paddingLeft = `${depth * 1.5}rem`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingLeft }}
      className="space-y-3"
    >
      <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4 backdrop-blur-xl`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-indigo-300">{getIcon(skill.name)}</div>
            <div>
              <p className="font-semibold text-white">{skill.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-[80px]">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.percentage}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                />
              </div>
            </div>
            <span className="min-w-[40px] text-right font-bold text-white">{skill.percentage}%</span>
          </div>
        </div>
      </div>

      {skill.children && skill.children.length > 0 && (
        <div className="space-y-3">
          {skill.children.map((child) => (
            <SkillItem key={child.name} skill={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function SkillTree() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div>
        <p className="text-xs sm:text-sm text-white/50">Skill Mastery</p>
        <h3 className="mt-1 text-lg sm:text-2xl font-black">Your Skill Tree</h3>
      </div>

      {/* Tree Container */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-8 backdrop-blur-xl overflow-x-auto">
        <SkillItem skill={skillTreeData} depth={0} />
      </div>

      {/* Legend */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-white/50">Mastery Levels</p>
          <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-5 rounded-full bg-red-500/50" />
              <span className="text-xs sm:text-sm text-white/70">0-25%: Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-6 rounded-full bg-yellow-500/50" />
              <span className="text-xs sm:text-sm text-white/70">25-50%: Familiar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-6 rounded-full bg-cyan-500/50" />
              <span className="text-xs sm:text-sm text-white/70">50-75%: Strong</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-6 rounded-full bg-green-500/50" />
              <span className="text-xs sm:text-sm text-white/70">75-100%: Mastered</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-indigo-200">💡 Tip</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-indigo-200/80">
            Focus on areas below 50% to unlock faster growth. Your weakest skills deserve the most attention.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

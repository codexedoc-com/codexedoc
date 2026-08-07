import React from "react";

/**
 * CommunityModeBadge — Non-intrusive visual indicator for local development.
 *
 * Rendered ONLY when `USE_AUTH=false` (Community Mode active).
 * Automatically disappears when `USE_AUTH=true` is enabled for production.
 *
 * @see ADR-002 — Authentication Architecture (Best Practice #24)
 */
export function CommunityModeBadge() {
  // If USE_AUTH is "true", we are in Production Mode — do not render badge
  if (process.env.USE_AUTH === "true") {
    return null;
  }

  return (
    <div
      aria-label="Community Mode Active"
      className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-full border border-indigo-500/30 bg-slate-900/90 px-3.5 py-1.5 text-xs text-white/90 shadow-xl backdrop-blur-md transition-all pointer-events-auto"
    >
      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-semibold text-indigo-300">Community Mode</span>
      <span className="text-white/30">|</span>
      <span className="text-white/70">
        User: <code className="font-mono text-[11px] text-emerald-300">mock-user</code>
      </span>
    </div>
  );
}

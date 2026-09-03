"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export function MobileLandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/auth"
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition active:scale-[0.99]"
        >
          Start Learning
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="absolute top-14 left-0 right-0 md:hidden border-b border-zinc-200 bg-white/95 backdrop-blur-md px-6 py-4 space-y-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#why"
            onClick={() => setOpen(false)}
            className="block py-1 text-sm font-semibold text-zinc-700 hover:text-indigo-600 transition"
          >
            Why It Works
          </a>
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="block py-1 text-sm font-semibold text-zinc-700 hover:text-indigo-600 transition"
          >
            Features
          </a>
          <a
            href="#system"
            onClick={() => setOpen(false)}
            className="block py-1 text-sm font-semibold text-zinc-700 hover:text-indigo-600 transition"
          >
            The System
          </a>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-indigo-600"
            >
              Sign In to Workspace →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

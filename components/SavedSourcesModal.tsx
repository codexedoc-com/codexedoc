"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Video,
  Music,
  FileCode,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
} from "lucide-react";
import {
  getSourceMaterialsAction,
  deleteSourceMaterialAction,
  regenerateCardsFromSavedSourceAction,
} from "@/server/actions/ingestionActions";
import { GeneratedCategory } from "@/server/services/aiService";

interface SavedSource {
  id: string;
  title: string;
  fileType: string;
  summary: string | null;
  extractedText: string;
  createdAt: Date;
}

interface SavedSourcesModalProps {
  goalId: string;
  onClose: () => void;
  onRegenerateCards: (documentTitle: string, categories: GeneratedCategory[]) => void;
}

export function SavedSourcesModal({
  goalId,
  onClose,
  onRegenerateCards,
}: SavedSourcesModalProps) {
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const loadSources = async () => {
    setLoading(true);
    const data = await getSourceMaterialsAction(goalId);
    setSources(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSources();
  }, [goalId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved document context?")) return;
    await deleteSourceMaterialAction(id);
    loadSources();
  };

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);
    const res = await regenerateCardsFromSavedSourceAction(id);
    setRegeneratingId(null);

    if (res.success && res.categories) {
      onRegenerateCards(res.documentTitle || "Source", res.categories);
      onClose();
    } else {
      alert("Failed to regenerate cards from this source.");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "video":
        return <Video className="h-4 w-4 text-indigo-600" />;
      case "audio":
        return <Music className="h-4 w-4 text-cyan-600" />;
      case "docx":
        return <FileCode className="h-4 w-4 text-emerald-600" />;
      default:
        return <FileText className="h-4 w-4 text-rose-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-zinc-900 truncate">Document Knowledge Base</h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                Persistent summaries & notes extracted from your materials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition cursor-pointer flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 flex-1 overflow-y-auto space-y-3 sm:space-y-4">
          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">Loading knowledge sources...</div>
          ) : sources.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-zinc-300 mb-2" />
              <p className="text-sm font-semibold text-zinc-700">No documents uploaded yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Upload PDFs, lecture videos, podcasts, or notes to build your persistent knowledge base.
              </p>
            </div>
          ) : (
            sources.map((source) => {
              const isExpanded = expandedId === source.id;
              const isGenerating = regeneratingId === source.id;

              return (
                <div
                  key={source.id}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 hover:border-zinc-300 transition"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getFileIcon(source.fileType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 break-words">{source.title}</h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(source.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="uppercase font-semibold text-[9px] sm:text-[10px]">{source.fileType}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-zinc-50 transition cursor-pointer"
                        title="Delete Source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {source.summary && (
                    <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/70 p-3 rounded-xl border border-zinc-100 break-words">
                      {source.summary}
                    </p>
                  )}

                  {/* Actions & Expandable Transcript */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : source.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition cursor-pointer py-1"
                    >
                      {isExpanded ? "Hide Notes" : "View Extracted Notes & Transcript"}
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      onClick={() => handleRegenerate(source.id)}
                      disabled={isGenerating}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {isGenerating ? "Generating..." : "Generate More Cards"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 max-h-52 overflow-y-auto font-mono text-[11px] text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {source.extractedText}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

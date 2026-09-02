"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Video,
  Music,
  FileCode,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  parseUploadedDocumentAction,
  saveGeneratedBlueprintAction,
} from "@/server/actions/ingestionActions";
import { IngestionResult, GeneratedCategory, GeneratedCard } from "@/server/services/aiService";

interface DocumentUploadModalProps {
  goalId: string;
  goalTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadModal({
  goalId,
  goalTitle,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review & Edit state
  const [draftResult, setDraftResult] = useState<IngestionResult | null>(null);
  const [showExtractedNotes, setShowExtractedNotes] = useState(false);
  const [categories, setCategories] = useState<GeneratedCategory[]>([]);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;
    setError(null);
    setStep("processing");

    const formData = new FormData();
    formData.append("file", file);
    if (goalTitle) formData.append("goalTitle", goalTitle);

    const res = await parseUploadedDocumentAction(formData);

    if (res.success && res.data) {
      setDraftResult(res.data);
      setCategories(res.data.categories || []);
      setStep("review");
    } else {
      setError(res.error || "Failed to analyze document. Please try again.");
      setStep("upload");
    }
  };

  const handleCardChange = (
    catIndex: number,
    cardIndex: number,
    field: keyof GeneratedCard,
    value: string | number
  ) => {
    const updated = [...categories];
    updated[catIndex].items[cardIndex] = {
      ...updated[catIndex].items[cardIndex],
      [field]: value,
    };
    setCategories(updated);
  };

  const handleDeleteCard = (catIndex: number, cardIndex: number) => {
    const updated = [...categories];
    updated[catIndex].items.splice(cardIndex, 1);
    setCategories(updated);
  };

  const handleAddCard = (catIndex: number) => {
    const updated = [...categories];
    updated[catIndex].items.push({
      prompt: "New prompt question...",
      answer: "Key concept answer...",
      type: "concept",
      difficulty: 2,
    });
    setCategories(updated);
  };

  const handleSaveToBlueprint = async () => {
    if (!draftResult) return;
    setSaving(true);

    const payload = {
      goalId,
      documentTitle: draftResult.documentTitle,
      fileType: draftResult.fileType,
      summary: draftResult.summary,
      extractedText: draftResult.extractedText,
      categories: categories.filter((c) => c.items.length > 0),
    };

    const res = await saveGeneratedBlueprintAction(payload);
    setSaving(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Failed to save blueprint.");
    }
  };

  const totalCardsCount = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                {step === "review" ? "Review & Customize Generated Blueprint" : "AI Document & Media Ingestion"}
              </h3>
              <p className="text-xs text-zinc-500">
                {step === "review"
                  ? "Tweak the extracted cards and summary before saving to your workspace."
                  : "Upload any PDF, Video, Audio, DOCX, or Text to generate flashcards automatically."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition ${
                  dragOver
                    ? "border-indigo-600 bg-indigo-50/50"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.docx,.doc,.txt,.md,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.mov"
                  className="hidden"
                />

                <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-zinc-900">{file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-zinc-900">
                      Click to upload or drag & drop your file
                    </p>
                    <p className="text-xs text-zinc-400">
                      Supports PDFs, Videos (MP4/WebM), Audio (MP3/WAV), Word DOCX, and Text
                    </p>
                  </div>
                )}
              </div>

              {/* Supported Formats Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 font-medium">
                  <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF Document
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 font-medium">
                  <Video className="h-3.5 w-3.5 text-indigo-500" /> Video & Slides
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 font-medium">
                  <Music className="h-3.5 w-3.5 text-cyan-500" /> Audio & Lectures
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 font-medium">
                  <FileCode className="h-3.5 w-3.5 text-emerald-500" /> Word (.docx) & Notes
                </span>
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!file}
                  onClick={handleProcessFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze & Generate Blueprint
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="py-20 text-center space-y-4">
              <div className="inline-block h-10 w-10 rounded-full border-3 border-indigo-600/20 border-t-indigo-600 animate-spin" />
              <div>
                <h4 className="font-bold text-base text-zinc-900">
                  Multimodal AI is analyzing {file?.name}...
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Extracting key principles, transcribing media, structuring topics, and drafting active recall flashcards.
                </p>
              </div>
            </div>
          )}

          {step === "review" && draftResult && (
            <div className="space-y-6">
              {/* Document Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Source Overview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowExtractedNotes(!showExtractedNotes)}
                    className="text-xs text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {showExtractedNotes ? "Hide Raw Notes" : "View Extracted Notes & Transcript"}
                    {showExtractedNotes ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <h4 className="font-bold text-sm text-zinc-900">{draftResult.documentTitle}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">{draftResult.summary}</p>

                {showExtractedNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-white border border-zinc-200 max-h-48 overflow-y-auto font-mono text-[11px] text-zinc-700 whitespace-pre-wrap">
                    {draftResult.extractedText}
                  </div>
                )}
              </div>

              {/* Categories & Cards Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-zinc-900">
                    Generated Blueprint Topics ({totalCardsCount} Flashcards)
                  </h4>
                </div>

                {categories.map((cat, catIdx) => (
                  <div
                    key={catIdx}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-white space-y-4"
                  >
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Layers className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const updated = [...categories];
                            updated[catIdx].name = e.target.value;
                            setCategories(updated);
                          }}
                          className="font-bold text-sm text-zinc-900 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-600 focus:outline-none w-full"
                        />
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                        {cat.items.length} cards
                      </span>
                    </div>

                    {/* Cards Inside Category */}
                    <div className="space-y-3">
                      {cat.items.map((card, cardIdx) => (
                        <div
                          key={cardIdx}
                          className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-2 hover:border-zinc-200 transition"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Card {cardIdx + 1} • {card.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(catIdx, cardIdx)}
                              className="text-zinc-400 hover:text-rose-600 p-1 transition cursor-pointer"
                              title="Delete Card"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={card.prompt}
                              onChange={(e) =>
                                handleCardChange(catIdx, cardIdx, "prompt", e.target.value)
                              }
                              placeholder="Front prompt / question"
                              className="w-full text-xs font-semibold text-zinc-900 bg-transparent focus:outline-none"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={card.answer}
                              onChange={(e) =>
                                handleCardChange(catIdx, cardIdx, "answer", e.target.value)
                              }
                              placeholder="Back answer / solution"
                              className="w-full text-xs text-zinc-600 bg-transparent focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCard(catIdx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Card to {cat.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "review" && (
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
            >
              ← Upload Another File
            </button>

            <button
              type="button"
              disabled={saving || totalCardsCount === 0}
              onClick={handleSaveToBlueprint}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {saving ? "Saving to Database..." : `Save ${totalCardsCount} Cards to Workspace`}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

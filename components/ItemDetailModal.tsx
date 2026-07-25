"use client";

import { useState } from "react";
import { X, Trash2, Edit3, Save, Star, Tag, FileText } from "lucide-react";

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

interface Props {
    item: Item;
    onClose: () => void;
    onUpdate?: (updatedItem: Item) => void;
    onDelete?: (itemId: string) => void;
}

export default function ItemDetailModal({ item, onClose, onUpdate, onDelete }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [prompt, setPrompt] = useState(item.prompt);
    const [answer, setAnswer] = useState(item.answer);
    const [type, setType] = useState(item.type || "vocab");
    const [difficulty, setDifficulty] = useState(item.difficulty || 3);
    const [notes, setNotes] = useState(item.notes || "");
    const [tagsInput, setTagsInput] = useState((item.tags || []).join(", "));

    const handleSave = () => {
        const updated: Item = {
            ...item,
            prompt,
            answer,
            type,
            difficulty,
            notes,
            tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        };
        onUpdate?.(updated);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm("¿Estás seguro de que deseas eliminar esta tarjeta de conocimiento?")) {
            onDelete?.(item.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl text-white space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 uppercase">
                            {type}
                        </span>
                        <span className="text-xs text-white/50">Nivel: {item.masteryLevel || "nuevo"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition"
                            >
                                <Edit3 className="h-3.5 w-3.5" /> Editar
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400 transition"
                            >
                                <Save className="h-3.5 w-3.5" /> Guardar
                            </button>
                        )}

                        <button
                            onClick={handleDelete}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                            title="Eliminar tarjeta"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <button onClick={onClose} className="rounded-xl p-1.5 text-white/50 hover:text-white transition">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content View or Edit Mode */}
                {!isEditing ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase font-bold text-white/40 mb-1">Pregunta / Prompt</p>
                            <h3 className="text-xl sm:text-2xl font-black leading-snug">{prompt}</h3>
                        </div>

                        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
                            <p className="text-xs uppercase font-bold text-indigo-300 mb-1">Respuesta</p>
                            <p className="text-lg font-semibold text-indigo-100">{answer}</p>
                        </div>

                        {/* Dificultad (1-5 Estrellas) */}
                        <div>
                            <p className="text-xs uppercase font-bold text-white/40 mb-2">Dificultad (1-5)</p>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-5 w-5 ${star <= difficulty ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Notas */}
                        {notes && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase font-bold text-white/40 flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" /> Notas Adicionales
                                </p>
                                <p className="text-sm text-white/70 bg-white/5 p-4 rounded-xl">{notes}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {tagsInput && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase font-bold text-white/40 flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5" /> Etiquetas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {tagsInput.split(",").map((t, idx) => (
                                        <span key={idx} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white/80">
                                            #{t.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Modo Edición */
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Tipo de Tarjeta</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                            >
                                <option value="vocab">Vocabulario</option>
                                <option value="phrase">Frase</option>
                                <option value="fact">Dato / Hecho</option>
                                <option value="concept">Concepto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1">Pregunta / Prompt</label>
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1">Respuesta</label>
                            <input
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1">Dificultad (1-5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setDifficulty(lvl)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${lvl === difficulty ? "bg-amber-500 text-black" : "bg-white/5 text-white/60"
                                            }`}
                                    >
                                        {lvl}★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1">Notas Adicionales</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Escribe aclaraciones, explicaciones o ejemplos..."
                                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1">Etiquetas (separadas por coma)</label>
                            <input
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                placeholder="mandarin, gramatica, hsk1"
                                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

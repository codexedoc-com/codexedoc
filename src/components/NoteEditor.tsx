import { useEffect, useState } from "react";
import TipTapEditor from "./TipTapEditor";
import { updateNote, deleteNote } from "../services/api";
import "../styles/NoteEditor.css";

type Props = {
  noteId: string | null;
  title: string;
  content: string;
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  onDelete: () => void;
};

export default function NoteEditor({
  noteId,
  title,
  content,
  setTitle,
  setContent,
  onDelete,
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 🔥 AUTOSAVE (debounced)
  useEffect(() => {
    if (!noteId) return;

    setIsSaving(true);
    const timeout = setTimeout(async () => {
      try {
        await updateNote(noteId, title, content);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to save note:", err);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [title, content, noteId]);

  const handleDelete = async () => {
    if (!noteId) return;

    const confirmed = window.confirm("Delete this note permanently?");
    if (!confirmed) return;

    try {
      await deleteNote(noteId);
      onDelete();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  if (!noteId) {
    return (
      <div className="note-editor">
        <div className="note-empty">
          Select a note or create a new one to get started
        </div>
      </div>
    );
  }

  const formatTime = (date: Date | null) => {
    if (!date) return "Not saved";
    return date.toLocaleTimeString();
  };

  return (
    <div className="note-editor">
      <div className="note-header">
        <input
          className="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
        />
        <span className="note-status">
          {isSaving ? "Saving..." : `Saved at ${formatTime(lastSaved)}`}
        </span>
      </div>

      <div className="note-content">
        <TipTapEditor content={content} onChange={setContent} />
      </div>

      <div className="note-footer">
        <button className="note-delete-btn" onClick={handleDelete}>
          🗑️ Delete Note
        </button>
      </div>
    </div>
  );
}
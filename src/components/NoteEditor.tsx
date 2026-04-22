import { useEffect, useState } from "react";
import TipTapEditor from "./TipTapEditor";
import { updateNote, deleteNote } from "../services/api";
import ModalDialog from "./common/ModalDialog";
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
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 🔥 AUTOSAVE (debounced with unmount flush) - saves silently without updating lastSaved
  useEffect(() => {
    if (!noteId) return;

    let didSave = false;
    const autoSaveNote = async () => {
      didSave = true;
      try {
        await updateNote(noteId, title, content);
        // Don't update lastSaved on auto-save - only on manual save
      } catch (err) {
        console.error("Failed to auto-save note:", err);
      }
    };

    const timeout = window.setTimeout(autoSaveNote, 800);

    return () => {
      clearTimeout(timeout);
      if (!didSave) {
        void autoSaveNote();
      }
    };
  }, [title, content, noteId]);

  useEffect(() => {
    setIsReadOnly(false);
  }, [noteId]);

  const handleSave = async () => {
    if (!noteId) return;
    setIsSaving(true);
    try {
      await updateNote(noteId, title, content);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!noteId) return;
    setShowDeleteModal(false);

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
    if (!date) return "Never saved";
    return date.toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
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
          disabled={isReadOnly}
        />
        <div className="note-header-actions">
          <button
            className="note-save-btn"
            onClick={handleSave}
            disabled={isSaving || isReadOnly}
            title="Save note"
          >
            <span className="note-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </span>
            Save
          </button>
          <button
            className="note-view-btn"
            onClick={() => setIsReadOnly((prev) => !prev)}
            title={isReadOnly ? "Switch back to edit mode" : "Switch to read-only mode"}
          >
            <span className="note-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h16"/>
                <path d="M4 6h16"/>
                <path d="M4 18h16"/>
              </svg>
            </span>
            {isReadOnly ? "Edit" : "View"}
          </button>
        </div>
        <span className="note-status">
          {isSaving ? "Saving..." : `Last saved: ${formatTime(lastSaved)}`}
        </span>
      </div>

      {isReadOnly && (
        <div className="note-view-message">
          Viewing note in read-only mode. Switch back to edit to make changes.
        </div>
      )}

      <div className="note-content">
        <TipTapEditor content={content} onChange={setContent} readOnly={isReadOnly} />
      </div>

      <div className="note-footer">
        <button className="note-delete-btn" onClick={handleDelete} title="Delete note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Delete Note
        </button>
      </div>

      <ModalDialog
        open={showDeleteModal}
        title="Delete Note"
        message="Are you sure you want to permanently delete this note? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        showCancel
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
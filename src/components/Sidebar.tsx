import { useEffect, useState } from "react";
import { listNotes, createNote } from "../services/api";
import { NoteMeta } from "../types";
import "../styles/Sidebar.css";

export default function Sidebar({ onSelect }: { onSelect: (id: string) => void }) {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading notes from API...");
      const data = await listNotes();
      console.log("Notes loaded successfully:", data);
      setNotes(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Failed to load notes:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleNewNote = async () => {
    setLoading(true);
    try {
      const id = await createNote("Untitled", "");
      await load();
      setSelectedId(id);
      onSelect(id);
    } catch (err) {
      console.error("Failed to create note:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNote = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Notes
        </h3>
        <button 
          className="sidebar-new-btn" 
          onClick={handleNewNote}
          disabled={loading}
        >
          + New Note
        </button>
      </div>

      {loading && <div style={{ padding: "16px", color: "#606060" }}>Loading notes...</div>}
      {error && <div style={{ padding: "16px", color: "red" }}>Error: {error}</div>}
      {!loading && !error && (
        <ul className="sidebar-list">
          {notes.length === 0 ? (
            <li style={{ padding: "16px", color: "#606060" }}>No notes yet</li>
          ) : (
            notes.map((note) => (
              <li
                key={note.id}
                className={`sidebar-item ${selectedId === note.id ? "active" : ""}`}
                onClick={() => handleSelectNote(note.id)}
                title={note.title || "Untitled"}
              >
                {note.title || "Untitled"}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
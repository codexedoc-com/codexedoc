import { useEffect, useState } from "react";
import { listNotes, createNote } from "../services/api";
import { NoteMeta } from "../types";
import "../styles/Sidebar.css";

export default function Sidebar({ onSelect }: { onSelect: (id: string) => void }) {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const data = await listNotes();
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
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
        <h3 className="sidebar-title">📝 Notes</h3>
        <button 
          className="sidebar-new-btn" 
          onClick={handleNewNote}
          disabled={loading}
        >
          + New Note
        </button>
      </div>

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
    </div>
  );
}
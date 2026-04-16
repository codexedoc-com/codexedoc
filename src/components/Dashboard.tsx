import { useState } from "react";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import FileVault from "./FileVault";
import Settings from "./Settings";
import { loadNote, getNoteMeta } from "../services/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"notes" | "files" | "settings">("notes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelect = async (id: string) => {
    const meta = await getNoteMeta(id);
    const noteContent = await loadNote(id);

    setSelectedId(id);
    setTitle(meta.title);
    setContent(noteContent);
  };

  const handleDelete = () => {
    setSelectedId(null);
    setTitle("");
    setContent("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            📝 Notes
          </button>
          <button
            className={`nav-tab ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            📁 Files
          </button>
          <button
            className={`nav-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {activeTab === "notes" && (
          <div className="dashboard-layout">
            <Sidebar key={refreshKey} onSelect={handleSelect} />
            <NoteEditor
              noteId={selectedId}
              title={title}
              content={content}
              setTitle={setTitle}
              setContent={setContent}
              onDelete={handleDelete}
            />
          </div>
        )}
        {activeTab === "files" && <FileVault />}
        {activeTab === "settings" && <Settings />}
      </div>
    </div>
  );
}

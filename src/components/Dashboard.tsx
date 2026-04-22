import { useState } from "react";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import FileVault from "./FileVault";
import Settings from "./Settings";
import { loadNote, getNoteMeta } from "../services/api";
import { FileEntry, FolderEntry } from "../types";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"notes" | "files" | "settings">("notes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [vaultFiles, setVaultFiles] = useState<FileEntry[]>([]);
  const [vaultFolders, setVaultFolders] = useState<FolderEntry[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState("/");

  const handleSelect = async (id: string) => {
    try {
      const meta = await getNoteMeta(id);
      const noteContent = await loadNote(id);

      setSelectedId(id);
      setTitle(meta.title);
      setContent(noteContent);
    } catch (error) {
      console.error("Failed to load note:", error);
    }
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Notes
          </button>
          <button
            className={`nav-tab ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Files
          </button>
          <button
            className={`nav-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <path d="M12 1v6m0 6v6" />
              <path d="M4.22 4.22l4.24 4.24m1.06 1.06l4.24 4.24M1 12h6m6 0h6" />
              <path d="M4.22 19.78l4.24-4.24m1.06-1.06l4.24-4.24M19.78 19.78l-4.24-4.24m-1.06-1.06l-4.24-4.24" />
            </svg>
            Settings
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
        {activeTab === "files" && (
          <FileVault
            files={vaultFiles}
            setFiles={setVaultFiles}
            folders={vaultFolders}
            setFolders={setVaultFolders}
            currentDirectory={currentDirectory}
            setCurrentDirectory={setCurrentDirectory}
          />
        )}
        {activeTab === "settings" && <Settings />}
      </div>
    </div>
  );
}

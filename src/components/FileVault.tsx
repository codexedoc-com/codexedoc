import { useState, useEffect } from "react";
import { saveVaultFile, deleteFile, listFiles } from "../services/api";
import { FileMeta } from "../types";
import "../styles/FileVault.css";

export default function FileVault() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const fileList = await listFiles();
      setFiles(fileList);
    } catch (err) {
      console.error("Failed to load files:", err);
      setError("Failed to load files from vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", droppedFiles);

    for (const file of droppedFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      await saveVaultFile(file.name, uint8Array);
      console.log(`Successfully uploaded: ${file.name}`);
      
      // Reload files list
      await loadFiles();
    } catch (err) {
      console.error("Failed to upload file:", err);
      setError(`Error saving file: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (id: string, filename: string) => {
    const confirmed = window.confirm(`Delete "${filename}" permanently?`);
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await deleteFile(id);
      await loadFiles();
    } catch (err) {
      console.error("Failed to delete file:", err);
      setError(`Error deleting file: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="file-vault">
      <div className="file-vault-header">
        <h2>📁 File Vault</h2>
        <p>Drag files here to encrypt and store them securely</p>
      </div>

      {error && (
        <div className="file-error">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      <div
        className={`file-drop-zone ${isDragging ? "dragging" : ""} ${isLoading ? "loading" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-icon">{isLoading ? "⏳" : "📥"}</div>
        <div className="drop-text">
          {isLoading ? "Uploading..." : "Drag files here to add them to your vault"}
        </div>
        <div className="drop-hint">or click to browse</div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Encrypted Files ({files.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="file-name">📄 {file.filename}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{new Date(file.created_at * 1000).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="file-action-btn delete"
                      onClick={() => handleDeleteFile(file.id, file.filename)}
                      disabled={isLoading}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && files.length === 0 && !error && (
        <div className="file-empty">
          <p>No encrypted files yet. Drag and drop files here to get started!</p>
        </div>
      )}
    </div>
  );
}

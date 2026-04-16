import { useState } from "react";
import "../styles/FileVault.css";

export default function FileVault() {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", droppedFiles);

    // TODO: Implement file encryption and storage
    // For now, just add to UI
    droppedFiles.forEach((file) => {
      setFiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(36),
          name: file.name,
          size: file.size,
          date: new Date().toISOString(),
        },
      ]);
    });
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

      <div
        className={`file-drop-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-icon">📥</div>
        <div className="drop-text">Drag files here to add them to your vault</div>
        <div className="drop-hint">or click to browse</div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Encrypted Files</h3>
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
                  <td className="file-name">📄 {file.name}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{new Date(file.date).toLocaleDateString()}</td>
                  <td>
                    <button className="file-action-btn">Download</button>
                    <button className="file-action-btn delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

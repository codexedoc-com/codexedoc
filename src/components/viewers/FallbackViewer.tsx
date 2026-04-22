import "../../styles/viewers/FallbackViewer.css";

interface FallbackViewerProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  onClose: () => void;
}

export default function FallbackViewer({ fileName, fileSize, fileType, onClose }: FallbackViewerProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fallback-viewer">
      <div className="viewer-header">
        <h3>{fileName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="viewer-content">
        <div className="fallback-message">
          <div className="file-icon">📁</div>
          <h3>Preview Not Available</h3>
          <p>This file type is not supported for preview in the vault.</p>
          <p>However, the file is securely stored and encrypted.</p>
          
          <div className="file-info">
            <div className="info-item">
              <span className="label">File Name:</span>
              <span className="value">{fileName}</span>
            </div>
            <div className="info-item">
              <span className="label">File Size:</span>
              <span className="value">{formatFileSize(fileSize)}</span>
            </div>
            <div className="info-item">
              <span className="label">File Type:</span>
              <span className="value">{fileType || "Unknown"}</span>
            </div>
          </div>
          
          <p className="security-note">
            ✓ File remains encrypted and is never written to disk in plaintext.
          </p>
        </div>
      </div>
    </div>
  );
}

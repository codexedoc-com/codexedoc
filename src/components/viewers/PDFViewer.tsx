import { useState } from "react";
import "../../styles/viewers/PDFViewer.css";

interface PDFViewerProps {
  blobUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function PDFViewer({ blobUrl, fileName, onClose }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="pdf-viewer">
      <div className="viewer-header">
        <h3>{fileName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="viewer-content">
        {isLoading && <div className="loading">Loading PDF...</div>}
        <iframe
          src={`${blobUrl}#toolbar=1`}
          onLoad={() => setIsLoading(false)}
          title={fileName}
        />
      </div>
    </div>
  );
}

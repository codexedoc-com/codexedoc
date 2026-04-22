import { useState, useEffect } from "react";
import "../../styles/viewers/TextViewer.css";

interface TextViewerProps {
  blobUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function TextViewer({ blobUrl, fileName, onClose }: TextViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadText = async () => {
      try {
        const response = await fetch(blobUrl);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError("Failed to load text file");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadText();
  }, [blobUrl]);

  return (
    <div className="text-viewer">
      <div className="viewer-header">
        <h3>{fileName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="viewer-content">
        {isLoading && <div className="loading">Loading text...</div>}
        {error && <div className="error">{error}</div>}
        {!isLoading && !error && (
          <pre className="text-content">{content}</pre>
        )}
      </div>
    </div>
  );
}

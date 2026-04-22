import { useEffect, useState } from "react";
import PDFViewer from "./PDFViewer";
import ImageViewer from "./ImageViewer";
import VideoViewer from "./VideoViewer";
import AudioViewer from "./AudioViewer";
import TextViewer from "./TextViewer";
import FallbackViewer from "./FallbackViewer";
import ModalDialog from "../common/ModalDialog";
import "../../styles/viewers/UniversalViewer.css";

interface UniversalViewerProps {
  decryptedBytes: Uint8Array;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  onClose: () => void;
}

export default function UniversalViewer({ 
  decryptedBytes, 
  fileName, 
  fileSize, 
  mimeType = "",
  onClose 
}: UniversalViewerProps) {
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  // Create a blob from the decrypted bytes
  const blob = new Blob([decryptedBytes], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // Detect file type from MIME type or extension
  const getFileType = (): string => {
    if (mimeType) {
      if (mimeType.startsWith("application/pdf")) return "pdf";
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      if (mimeType.startsWith("audio/")) return "audio";
      if (mimeType.startsWith("text/")) return "text";
    }

    // Fallback to extension-based detection
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    
    const pdfExts = ["pdf"];
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const videoExts = ["mp4", "webm", "avi", "mov", "mkv", "flv", "wmv"];
    const audioExts = ["mp3", "wav", "aac", "ogg", "flac", "m4a", "wma"];
    const textExts = ["txt", "md", "json", "xml", "html", "css", "js", "ts", "py", "java", "cpp"];

    if (pdfExts.includes(ext)) return "pdf";
    if (imageExts.includes(ext)) return "image";
    if (videoExts.includes(ext)) return "video";
    if (audioExts.includes(ext)) return "audio";
    if (textExts.includes(ext)) return "text";

    return "fallback";
  };

  const fileType = getFileType();

  const handleDownload = () => {
    setShowDownloadConfirm(true);
  };

  const confirmDownload = () => {
    setShowDownloadConfirm(false);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const viewerContent = (() => {
    switch (fileType) {
      case "pdf":
        return <PDFViewer blobUrl={blobUrl} fileName={fileName} onClose={onClose} />;
      case "image":
        return <ImageViewer blobUrl={blobUrl} fileName={fileName} onClose={onClose} />;
      case "video":
        return <VideoViewer blobUrl={blobUrl} fileName={fileName} onClose={onClose} />;
      case "audio":
        return <AudioViewer blobUrl={blobUrl} fileName={fileName} onClose={onClose} />;
      case "text":
        return <TextViewer blobUrl={blobUrl} fileName={fileName} onClose={onClose} />;
      case "fallback":
      default:
        return (
          <FallbackViewer
            fileName={fileName}
            fileSize={fileSize}
            fileType={mimeType || "Unknown"}
            onClose={onClose}
          />
        );
    }
  })();

  return (
    <div className="universal-viewer-container">
      <div className="universal-viewer-modal">
        <div className="universal-viewer-actions">
          <div className="viewer-file-label">Preview: {fileName}</div>
          <button className="viewer-download-btn" onClick={handleDownload}>
            Download
          </button>
        </div>
        {viewerContent}
      </div>

      <ModalDialog
        open={showDownloadConfirm}
        title="Download File"
        message="This file will be downloaded to your computer and will no longer be protected by the vault. Continue?"
        confirmLabel="Download"
        cancelLabel="Cancel"
        danger
        showCancel
        onConfirm={confirmDownload}
        onClose={() => setShowDownloadConfirm(false)}
      />
    </div>
  );
}

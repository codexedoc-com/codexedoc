import "../../styles/viewers/ImageViewer.css";

interface ImageViewerProps {
  blobUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function ImageViewer({ blobUrl, fileName, onClose }: ImageViewerProps) {
  return (
    <div className="image-viewer">
      <div className="viewer-header">
        <h3>{fileName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="viewer-content">
        <img src={blobUrl} alt={fileName} />
      </div>
    </div>
  );
}

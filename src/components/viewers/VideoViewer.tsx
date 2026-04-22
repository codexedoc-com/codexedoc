import "../../styles/viewers/VideoViewer.css";

interface VideoViewerProps {
  blobUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function VideoViewer({ blobUrl, fileName, onClose }: VideoViewerProps) {
  return (
    <div className="video-viewer">
      <div className="viewer-header">
        <h3>{fileName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="viewer-content">
        <video controls>
          <source src={blobUrl} />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

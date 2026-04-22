import "../../styles/viewers/AudioViewer.css";

interface AudioViewerProps {
  blobUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function AudioViewer({ blobUrl, fileName, onClose }: AudioViewerProps) {
  return (
    <div className="audio-viewer">
      <div className="viewer-header">
        <h3>{fileName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="viewer-content">
        <audio controls style={{ width: "100%" }}>
          <source src={blobUrl} />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}

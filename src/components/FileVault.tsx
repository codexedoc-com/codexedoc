import { useState, useRef, type ChangeEvent, type DragEvent, type Dispatch, type SetStateAction } from "react";
import UniversalViewer from "./viewers/UniversalViewer";
import ModalDialog from "./common/ModalDialog";
import { FileEntry, FolderEntry } from "../types";
import { saveVaultFile, deleteVaultFile } from "../services/api";
import "../styles/FileVault.css";

type FileVaultProps = {
  files: FileEntry[];
  setFiles: Dispatch<SetStateAction<FileEntry[]>>;
  folders: FolderEntry[];
  setFolders: Dispatch<SetStateAction<FolderEntry[]>>;
  currentDirectory: string;
  setCurrentDirectory: Dispatch<SetStateAction<string>>;
};

export default function FileVault({
  files,
  setFiles,
  folders,
  setFolders,
  currentDirectory,
  setCurrentDirectory,
}: FileVaultProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState("");
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (fileList: FileList | null) => {
    if (!fileList) return;

    const selectedFiles = Array.from(fileList);
    console.log("Selected files:", selectedFiles);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const fileEntry: FileEntry = {
          id: Math.random().toString(36),
          name: file.name,
          size: file.size,
          date: new Date().toISOString(),
          type: file.type,
          directory: currentDirectory,
          dataUrl,
        };
        
        // Metadata to save (without dataUrl, which is stored separately)
        const metadata = JSON.stringify({
          id: fileEntry.id,
          name: fileEntry.name,
          size: fileEntry.size,
          date: fileEntry.date,
          type: fileEntry.type,
          directory: fileEntry.directory,
        });
        
        // Extract base64 data from dataUrl
        const base64Data = dataUrl.split(",")[1] || dataUrl;
        
        // Save to disk
        saveVaultFile(fileEntry.id, metadata, base64Data)
          .then(() => {
            console.log("File saved successfully:", fileEntry.id);
          })
          .catch((error) => {
            console.error("Failed to save file:", error);
            alert(`Error saving file: ${error}`);
          });
        
        setFiles((prev) => [...prev, fileEntry]);
      };
      reader.onerror = () => {
        console.error("Failed to read file:", file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleModalClick = () => {
    modalFileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleModalInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
    setShowUploadModal(false);
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handlePreviewFile = (file: FileEntry) => {
    setPreviewFile(file);
    setShowViewer(true);
  };

  const handleDeleteFile = (fileId: string) => {
    setDeleteFileId(fileId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFile = () => {
    if (deleteFileId) {
      const fileToDelete = files.find((file) => file.id === deleteFileId);
      
      // Delete from disk
      if (fileToDelete) {
        deleteVaultFile(fileToDelete.id)
          .catch((error) => console.error("Failed to delete file from disk:", error));
      }
      
      setFiles((prev) => prev.filter((file) => file.id !== deleteFileId));
      setShowDeleteConfirm(false);
      setDeleteFileId(null);
    }
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setRenameFolderId(folderId);
    setRenameFolderValue(currentName);
    setShowRenameFolderModal(true);
  };

  const confirmRenameFolder = () => {
    if (!renameFolderId || !renameFolderValue.trim()) {
      setAlertMessage("Please enter a valid folder name.");
      setShowAlertModal(true);
      return;
    }

    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id === renameFolderId) {
          const parentPath = folder.path.substring(0, folder.path.lastIndexOf(folder.name));
          return {
            ...folder,
            name: renameFolderValue,
            path: parentPath + renameFolderValue,
          };
        }
        return folder;
      })
    );

    setShowRenameFolderModal(false);
    setRenameFolderId(null);
    setRenameFolderValue("");
  };

  const handleDeleteFolder = (folderId: string) => {
    setDeleteFolderId(folderId);
    setShowDeleteFolderConfirm(true);
  };

  const confirmDeleteFolder = () => {
    if (deleteFolderId) {
      setFolders((prev) => prev.filter((f) => f.id !== deleteFolderId));
      setShowDeleteFolderConfirm(false);
      setDeleteFolderId(null);
    }
  };

  const handleOpenMoveModal = (fileId: string) => {
    setMoveFileId(fileId);
    setMoveTargetFolderId("");
    setShowMoveModal(true);
  };

  const handleMoveFile = () => {
    if (!moveFileId || !moveTargetFolderId) {
      setAlertMessage("Please choose a folder to move the file into.");
      setShowAlertModal(true);
      return;
    }

    const folder = folders.find((f) => f.id === moveTargetFolderId);
    if (!folder) {
      setAlertMessage("Selected folder is no longer available.");
      setShowAlertModal(true);
      return;
    }

    setFiles((prev) =>
      prev.map((file) =>
        file.id === moveFileId
          ? { ...file, directory: `${folder.path}/` }
          : file
      )
    );
    setShowMoveModal(false);
    setMoveFileId(null);
    setMoveTargetFolderId("");
  };

  const closeViewer = () => {
    setShowViewer(false);
    setPreviewFile(null);
  };

  const getBytesFromDataUrl = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    handleFileSelection(e.dataTransfer?.files || null);
  };

  const handleModalDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalDragging(true);
  };

  const handleModalDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsModalDragging(false);
    }
  };

  const handleModalDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalDragging(false);

    handleFileSelection(e.dataTransfer.files);
    setShowUploadModal(false);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      setAlertMessage("Please enter a folder name.");
      setShowAlertModal(true);
      return;
    }

    const newFolder = {
      id: Math.random().toString(36),
      name: newFolderName,
      path: `${currentDirectory}${newFolderName}`,
      created: new Date().toISOString(),
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setShowCreateFolder(false);
  };

  const handleNavigateFolder = (folderPath: string) => {
    setCurrentDirectory(folderPath + "/");
  };

  const handleBackFolder = () => {
    const parts = currentDirectory.split("/").filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      setCurrentDirectory(parts.length > 0 ? "/" + parts.join("/") + "/" : "/");
    }
  };

  const getFilesInCurrentDir = () => {
    return files.filter((f) => f.directory === currentDirectory);
  };

  const getFoldersInCurrentDir = () => {
    return folders.filter((f) => f.path.startsWith(currentDirectory) && f.path.split("/").filter(Boolean).length === currentDirectory.split("/").filter(Boolean).length + 1);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div 
      className={`file-vault ${isDragging ? "dragging" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="file-vault-header">
        <h2>📁 File Vault</h2>
        <p>Drag files here to encrypt and store them securely</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      <input
        ref={modalFileInputRef}
        type="file"
        multiple
        onChange={handleModalInputChange}
        style={{ display: "none" }}
      />

      <div className="vault-navigation">
        <div className="directory-path">
          <span className="path-label">Current Directory:</span>
          <span className="path-value">{currentDirectory}</span>
          {currentDirectory !== "/" && (
            <button 
              className="back-btn"
              onClick={handleBackFolder}
              title="Go back to parent directory"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
        </div>

        <div className="vault-controls">
          <button 
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
            title="Upload files"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
          <button 
            className="create-folder-btn"
            onClick={() => setShowCreateFolder(true)}
            title="Create new folder"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            Create Folder
          </button>
        </div>
      </div>

      {showCreateFolder && (
        <div className="create-folder-modal">
          <div className="modal-content">
            <h3>Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
              autoFocus
            />
            <div className="modal-buttons">
              <button 
                className="btn-primary"
                onClick={handleCreateFolder}
              >
                Create
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Files</h3>
            <div
              className={`modal-drop-zone ${isModalDragging ? "dragging" : ""}`}
              onDragOver={handleModalDragOver}
              onDragLeave={handleModalDragLeave}
              onDrop={handleModalDrop}
              onClick={handleModalClick}
            >
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="drop-text">Drag files here</div>
              <div className="drop-hint">or click to browse</div>
            </div>
            <button 
              className="btn-secondary"
              onClick={() => setShowUploadModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <input
        ref={modalFileInputRef}
        type="file"
        multiple
        onChange={handleModalInputChange}
        style={{ display: "none" }}
      />

      {getFoldersInCurrentDir().length > 0 && (
        <div className="folders-section">
          <h3>📁 Folders</h3>
          <div className="folder-list">
            {getFoldersInCurrentDir().map((folder) => (
              <div 
                key={folder.id} 
                className="folder-item"
              >
                <div className="folder-content" onClick={() => handleNavigateFolder(folder.path)}>
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">{folder.name}</span>
                </div>
                <div className="folder-actions">
                  <button 
                    className="folder-action-btn rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameFolder(folder.id, folder.name);
                    }}
                    title="Rename folder"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>
                  <button 
                    className="folder-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    title="Delete folder"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {getFilesInCurrentDir().length > 0 && (
        <div className="file-list">
          <h3>📄 Files</h3>
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
              {getFilesInCurrentDir().map((file) => (
                <tr key={file.id}>
                  <td className="file-name">📄 {file.name}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{new Date(file.date).toLocaleDateString()}</td>
                  <td>
                    <button className="file-action-btn" onClick={() => handlePreviewFile(file)}>
                      View
                    </button>
                    <button className="file-action-btn" onClick={() => handleOpenMoveModal(file.id)}>
                      Move
                    </button>
                    <button className="file-action-btn delete" onClick={() => handleDeleteFile(file.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showViewer && previewFile && (
        <div className="viewer-overlay" onClick={closeViewer}>
          <div className="viewer-modal" onClick={(e) => e.stopPropagation()}>
            <UniversalViewer
              decryptedBytes={getBytesFromDataUrl(previewFile.dataUrl)}
              fileName={previewFile.name}
              fileSize={previewFile.size}
              mimeType={previewFile.type}
              onClose={closeViewer}
            />
          </div>
        </div>
      )}

      <ModalDialog
        title="Invalid folder name"
        open={showAlertModal}
        message={alertMessage}
        showCancel={false}
        onConfirm={() => setShowAlertModal(false)}
        onClose={() => setShowAlertModal(false)}
      />

      <ModalDialog
        title="Move File"
        open={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onConfirm={handleMoveFile}
        confirmLabel="Move"
        cancelLabel="Cancel"
      >
        <div>
          <p>Choose a folder to move the file into:</p>
          <select
            value={moveTargetFolderId}
            onChange={(e) => setMoveTargetFolderId(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "8px" }}
          >
            <option value="">Select a folder...</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      </ModalDialog>

      <ModalDialog
        title="Delete File"
        open={showDeleteConfirm}
        message={`Are you sure you want to delete this file? This action cannot be undone.`}
        danger
        showCancel
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteFile}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteFileId(null);
        }}
      />

      {showRenameFolderModal && (
        <div className="create-folder-modal">
          <div className="modal-content">
            <h3>Rename Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={renameFolderValue}
              onChange={(e) => setRenameFolderValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") confirmRenameFolder();
              }}
              autoFocus
            />
            <div className="modal-buttons">
              <button 
                className="btn-primary"
                onClick={confirmRenameFolder}
              >
                Rename
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowRenameFolderModal(false);
                  setRenameFolderId(null);
                  setRenameFolderValue("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalDialog
        title="Delete Folder"
        open={showDeleteFolderConfirm}
        message={`Are you sure you want to delete this folder? This action cannot be undone.`}
        danger
        showCancel
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteFolder}
        onClose={() => {
          setShowDeleteFolderConfirm(false);
          setDeleteFolderId(null);
        }}
      />
    </div>
  );
}

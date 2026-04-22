import { ReactNode } from "react";
import "../../styles/ModalDialog.css";

type ModalDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  showCancel?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ModalDialog({
  open,
  title = "Notice",
  message,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  showCancel = true,
  onConfirm,
  onClose,
}: ModalDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-dialog-overlay" role="dialog" aria-modal="true">
      <div className="modal-dialog-card">
        <div className="modal-dialog-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-dialog-body">
          {children ? children : <p>{message}</p>}
        </div>
        <div className="modal-dialog-actions">
          {showCancel && (
            <button className="modal-dialog-btn cancel" onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button
            className={`modal-dialog-btn confirm ${danger ? "danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

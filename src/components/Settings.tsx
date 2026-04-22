import { useState } from "react";
import { resetVault } from "../services/api";
import ModalDialog from "./common/ModalDialog";
import "../styles/Settings.css";

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  showCancel?: boolean;
  onConfirm: () => void;
};

export default function Settings() {
  const [licenseKey, setLicenseKey] = useState("");
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);

  const showMessage = (message: string, title = "Notice") => {
    setModal({
      open: true,
      title,
      message,
      confirmLabel: "OK",
      cancelLabel: "",
      danger: false,
      showCancel: false,
      onConfirm: () => setModal(null),
    });
  };

  const handleEnterLicense = async () => {
    if (!licenseKey.trim()) {
      showMessage("Please enter a license key", "Missing License");
      return;
    }
    showMessage(`License key entered: ${licenseKey}`, "License Key");
  };

  const handleExportVault = async () => {
    if (!exportPassword.trim()) {
      showMessage("Please enter a password for the backup", "Backup Password Required");
      return;
    }
    showMessage("Vault export started (feature coming soon)", "Export Vault");
  };

  const handleImportVault = async () => {
    showMessage("Import feature coming soon", "Import Vault");
  };

  const confirmReset = async () => {
    if (!resetPassword.trim()) {
      showMessage("Please enter your current password to reset the vault.", "Password Required");
      return;
    }

    setModal({
      open: true,
      title: "Reset Entire Vault",
      message:
        "Resetting the vault will permanently delete the password, all notes, all vault files, and all metadata. The application will then reload to the setup screen.",
      confirmLabel: "Reset Vault",
      cancelLabel: "Cancel",
      danger: true,
      showCancel: true,
      onConfirm: async () => {
        setModal(null);
        try {
          await resetVault();
          window.location.reload();
        } catch (err) {
          setModal({
            open: true,
            title: "Reset Failed",
            message: `Unable to reset vault: ${err}`,
            confirmLabel: "OK",
            cancelLabel: "",
            danger: false,
            showCancel: false,
            onConfirm: () => setModal(null),
          });
        }
      },
    });
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <section className="settings-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
              <polyline points="7 2 7 22" />
              <line x1="11" y1="2" x2="11" y2="22" />
              <line x1="15" y1="2" x2="15" y2="22" />
              <line x1="7" y1="13" x2="22" y2="13" />
            </svg>
            License Key
          </h3>
          <p className="settings-description">
            Enter your CODEXEDOC KEY to unlock advanced features like secure file sharing and advanced search.
          </p>
          <div className="settings-form">
            <input
              type="text"
              placeholder="CODEXEDOC-KEY: XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
            <button onClick={handleEnterLicense}>Enter License</button>
          </div>
        </section>

        <section className="settings-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Backup & Restore
          </h3>
          <p className="settings-description">
            Export your entire vault as an encrypted backup file (.cdx) that you can store securely or import on another device.
          </p>

          <div className="backup-buttons">
            <div>
              <h4>Export Vault</h4>
              {!showExportForm ? (
                <button onClick={() => setShowExportForm(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Backup
                </button>
              ) : (
                <div className="export-form">
                  <input
                    type="password"
                    placeholder="Backup password (for added security)"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                  />
                  <button onClick={handleExportVault}>
                    Create Backup
                  </button>
                  <button
                    onClick={() => {
                      setShowExportForm(false);
                      setExportPassword("");
                    }}
                    style={{ background: "#404040" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <h4>Import Vault</h4>
              <button onClick={handleImportVault}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 10 12 15 7 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Import Backup
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Reset Vault
          </h3>
          <p className="settings-description">
            This will permanently delete all notes and files stored locally. You must confirm with your password and accept that this action cannot be undone.
          </p>
          <div className="reset-vault-form">
            <input
              type="password"
              placeholder="Enter current password to confirm"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
            <div className="reset-actions">
              <button className="reset-btn" onClick={confirmReset}>
                Reset Vault
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setResetPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            About
          </h3>
          <p>
            <strong>CODEXEDOC</strong> v0.1.0<br />
            A privacy-first, local-first encrypted vault system.
          </p>
          <p className="settings-description">
            Everything is stored locally on your device. No cloud. No servers. Just your data, encrypted with AES-256.
          </p>
        </section>
      </div>

      {modal && (
        <ModalDialog
          open={modal.open}
          title={modal.title}
          message={modal.message}
          confirmLabel={modal.confirmLabel}
          cancelLabel={modal.cancelLabel}
          danger={modal.danger}
          showCancel={modal.showCancel}
          onConfirm={modal.onConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

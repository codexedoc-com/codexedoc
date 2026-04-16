import { useState } from "react";
import "../styles/Settings.css";

export default function Settings() {
  const [licenseKey, setLicenseKey] = useState("");
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportPassword, setExportPassword] = useState("");

  const handleEnterLicense = async () => {
    if (!licenseKey.trim()) {
      alert("Please enter a license key");
      return;
    }
    // TODO: Validate license key against Rust backend
    alert(`License key entered: ${licenseKey}`);
  };

  const handleExportVault = async () => {
    if (!exportPassword.trim()) {
      alert("Please enter a password for the backup");
      return;
    }
    // TODO: Call exportVault command in Rust
    alert("Vault export started (feature coming soon)");
  };

  const handleImportVault = async () => {
    // TODO: Implement file picker and import
    alert("Import feature coming soon");
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <section className="settings-section">
          <h3>🔑 License Key</h3>
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
          <h3>💾 Backup & Restore</h3>
          <p className="settings-description">
            Export your entire vault as an encrypted backup file (.cdx) that you can store securely or import on another device.
          </p>

          <div className="backup-buttons">
            <div>
              <h4>Export Vault</h4>
              {!showExportForm ? (
                <button onClick={() => setShowExportForm(true)}>
                  📥 Export Backup
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
                📤 Import Backup
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>ℹ️ About</h3>
          <p>
            <strong>CODEXEDOC</strong> v0.1.0<br />
            A privacy-first, local-first encrypted vault system.
          </p>
          <p className="settings-description">
            Everything is stored locally on your device. No cloud. No servers. Just your data, encrypted with AES-256.
          </p>
        </section>
      </div>
    </div>
  );
}

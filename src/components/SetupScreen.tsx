import { useState } from "react";
import { setupVault } from "../services/api";
import { validatePassword } from "../lib/passwordValidator";
import "../styles/SetupScreen.css";
import logo from "../assets/logo.png";

export default function SetupScreen({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const validation = validatePassword(password);

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}';:,.<>?";
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let newPassword = "";
    
    // Ensure at least one of each required type
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = newPassword.length; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setGeneratedPassword(newPassword);
  };

  const handleSetup = async () => {
    // Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check validation
    if (!validation.isValid) {
      setError("Password does not meet requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await setupVault(password);
      if (success) {
        onSetupComplete();
      } else {
        setError("Failed to setup vault");
      }
    } catch (err) {
      setError("Setup failed: " + String(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && validation.isValid && password === confirmPassword) {
      handleSetup();
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-container">
        <img className="logo" src={logo} alt="CODEXEDOC Logo" />
        <h1>Welcome to CODEXEDOC</h1>
        <p className="setup-subtitle">Create a master password to secure your vault</p>

        <div className="setup-form">
          <button
            onClick={generatePassword}
            type="button"
            className="generate-password-btn"
            disabled={loading}
          >
            ⚡ Generate Password
          </button>
          
          <p className="generate-password-help">
            Generated passwords are extremely strong but harder to remember.
          </p>

          {generatedPassword && (
            <div className="generated-password-box">
              <p className="generated-password-label">Generated Password:</p>
              <div className="generated-password-display">{generatedPassword}</div>
              <p className="generated-password-note">💾 Write this down or save it somewhere safe</p>
            </div>
          )}

          <div className="form-group">
            <label>Master Password</label>
            <input
              type="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowRequirements(true)}
              onBlur={() => setShowRequirements(false)}
              disabled={loading}
              autoFocus
            />
          </div>

          {showRequirements && password && (
            <div className={`password-requirements ${validation.isValid ? "valid" : "invalid"}`}>
              <h4>Password Requirements:</h4>
              <ul>
                <li className={password.length >= 12 ? "met" : "unmet"}>
                  ✓ At least 12 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "met" : "unmet"}>
                  ✓ One uppercase letter (A-Z)
                </li>
                <li className={/[a-z]/.test(password) ? "met" : "unmet"}>
                  ✓ One lowercase letter (a-z)
                </li>
                <li className={/[0-9]/.test(password) ? "met" : "unmet"}>
                  ✓ One number (0-9)
                </li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "met" : "unmet"}>
                  ✓ One symbol (! @ # $ % ^ & * etc.)
                </li>
              </ul>
            </div>
          )}

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              onKeyPress={handleKeyPress}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <div className="error-text">Passwords do not match</div>
            )}
          </div>

          {error && <div className="setup-error">{error}</div>}

          <button
            onClick={handleSetup}
            disabled={!validation.isValid || password !== confirmPassword || loading}
            className="setup-button"
          >
            {loading ? "Setting up..." : "Create Vault"}
          </button>
        </div>

        <p className="setup-info">
          💡 <strong>Tip:</strong> This password encrypts all your data. Don't forget it!
        </p>
        
        <p className="security-notice">
          🔒 <strong>Your password is only as secure as where you store it and your vault is only as secure as your password.</strong>
        </p>
      </div>
    </div>
  );
}

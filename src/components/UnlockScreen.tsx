import { useState } from "react";
import { unlockVault } from "../services/api";
import "../styles/UnlockScreen.css";

export default function UnlockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await unlockVault(password);
      if (success) {
        onUnlock();
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Failed to unlock vault");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  return (
    <div className="unlock-screen">
      <div className="unlock-screen-container">
        <h1>🔒 CODEXEDOC</h1>
        <p>Unlock your encrypted vault with your password</p>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          autoFocus
        />

        {error && <div className="unlock-error">{error}</div>}

        <button onClick={handleUnlock} disabled={loading}>
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { unlockVault } from "../services/api";
import "../styles/UnlockScreen.css";
import logo from "../assets/logo.png";

interface LockoutState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

export default function UnlockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutState, setLockoutState] = useState<LockoutState>({ failedAttempts: 0, lockoutUntil: null });
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>("");

  // Load lockout state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("vaultLockout");
    if (stored) {
      try {
        const state = JSON.parse(stored) as LockoutState;
        setLockoutState(state);
        checkLockoutStatus(state);
      } catch (err) {
        console.error("Failed to parse lockout state:", err);
      }
    }
  }, []);

  // Update remaining time display
  useEffect(() => {
    if (!lockoutState.lockoutUntil) {
      setIsLocked(false);
      setRemainingTime("");
      return;
    }

    const checkLockout = () => {
      const now = Date.now();
      if (!lockoutState.lockoutUntil || now >= lockoutState.lockoutUntil) {
        // Lockout expired
        setIsLocked(false);
        setRemainingTime("");
      } else {
        setIsLocked(true);
        const timeLeft = lockoutState.lockoutUntil - now;
        const minutes = Math.ceil(timeLeft / 60000);
        if (minutes < 1) {
          setRemainingTime("less than a minute");
        } else if (minutes === 1) {
          setRemainingTime("1 minute");
        } else {
          setRemainingTime(`${minutes} minutes`);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutState.lockoutUntil]);

  const checkLockoutStatus = (state: LockoutState) => {
    if (!state.lockoutUntil) return;
    const now = Date.now();
    if (now >= state.lockoutUntil) {
      setIsLocked(false);
    } else {
      setIsLocked(true);
    }
  };

  const getLockoutDuration = (failedAttempts: number): number => {
    if (failedAttempts >= 20) return 24 * 60 * 60 * 1000; // 24 hours
    if (failedAttempts >= 15) return 60 * 60 * 1000; // 1 hour
    if (failedAttempts >= 10) return 15 * 60 * 1000; // 15 minutes
    if (failedAttempts >= 5) return 5 * 60 * 1000; // 5 minutes
    return 0;
  };

  const getLockoutMessage = (failedAttempts: number): string => {
    const remainingAttempts = 25 - failedAttempts;
    
    if (failedAttempts >= 20) {
      return `Try again in 24 hours. (${remainingAttempts} attempts remaining before permanent deletion)`;
    }
    if (failedAttempts >= 15) {
      return `Try again in 1 hour. (${remainingAttempts} attempts remaining)`;
    }
    if (failedAttempts >= 10) {
      return `Try again in 15 minutes. (${remainingAttempts} attempts remaining)`;
    }
    if (failedAttempts >= 5) {
      return `Try again in 5 minutes. (${remainingAttempts} attempts remaining)`;
    }
    return "";
  };

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    // Check if account is locked
    if (isLocked && lockoutState.lockoutUntil && Date.now() < lockoutState.lockoutUntil) {
      setError(getLockoutMessage(lockoutState.failedAttempts));
      return;
    }

    // If lockout time has passed, clear it
    if (lockoutState.lockoutUntil && Date.now() >= lockoutState.lockoutUntil) {
      const newState: LockoutState = { failedAttempts: lockoutState.failedAttempts, lockoutUntil: null };
      setLockoutState(newState);
      localStorage.setItem("vaultLockout", JSON.stringify(newState));
      setIsLocked(false);
    }

    setLoading(true);
    setError("");

    try {
      const success = await unlockVault(password);
      if (success) {
        // Reset failed attempts on successful unlock
        const newState: LockoutState = { failedAttempts: 0, lockoutUntil: null };
        setLockoutState(newState);
        localStorage.setItem("vaultLockout", JSON.stringify(newState));
        onUnlock();
      } else {
        // Handle failed attempt
        const newFailedAttempts = lockoutState.failedAttempts + 1;

        // Check if we've reached 25 attempts (permanent reset)
        if (newFailedAttempts >= 25) {
          // In a real app, this would trigger a backend operation to delete the vault
          setError("Maximum attempts exceeded. Your vault has been permanently deleted. Please restart the app to set up a new vault.");
          localStorage.removeItem("vaultLockout");
          // Here you would call an API to delete the vault
          return;
        }

        const lockoutDuration = getLockoutDuration(newFailedAttempts);
        const lockoutUntil = lockoutDuration > 0 ? Date.now() + lockoutDuration : null;

        const newState: LockoutState = { failedAttempts: newFailedAttempts, lockoutUntil };
        setLockoutState(newState);
        localStorage.setItem("vaultLockout", JSON.stringify(newState));

        if (lockoutUntil) {
          setIsLocked(true);
          setError(getLockoutMessage(newFailedAttempts));
        } else {
          setError(`Invalid password (${newFailedAttempts} attempt${newFailedAttempts > 1 ? "s" : ""} failed)`);
        }
      }
    } catch (err) {
      setError("Failed to unlock vault");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLocked) {
      handleUnlock();
    }
  };

  return (
    <div className="unlock-screen">
      <div className="unlock-screen-container">
        <img className="logo" src={logo} alt="CODEXEDOC Logo" />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || isLocked}
          autoFocus
        />

        {error && (
          <div className={`unlock-error ${isLocked ? "locked" : ""}`}>
            {error}
            {isLocked && remainingTime && (
              <div className="remaining-time">Locked for: {remainingTime}</div>
            )}
          </div>
        )}

        <button 
          onClick={handleUnlock} 
          disabled={loading || isLocked}
          className={isLocked ? "locked" : ""}
        >
          {loading ? "UNLOCKING..." : isLocked ? `LOCKED - TRY AGAIN IN ${remainingTime}` : "UNLOCK"}
        </button>

        {isLocked && lockoutState.failedAttempts > 0 && (
          <div className="lockout-info">
            <p className="attempt-counter">
              Failed attempts: {lockoutState.failedAttempts}
              {lockoutState.failedAttempts >= 20 && (
                <span className="warning"> ⚠️ Final attempts - vault will be deleted</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import UnlockScreen from "./components/UnlockScreen";
import SetupScreen from "./components/SetupScreen";
import Dashboard from "./components/Dashboard";
import { checkVaultExists } from "./services/api";

export default function App() {
  const [state, setState] = useState<"loading" | "setup" | "unlock" | "dashboard">("setup");
  const [debugMessage, setDebugMessage] = useState("Initializing...");
  const [attemptedCheck, setAttemptedCheck] = useState(false);

  useEffect(() => {
    if (attemptedCheck) return; // Only check once

    const checkSetup = async () => {
      try {
        setDebugMessage("Checking vault...");
        const exists = await checkVaultExists();
        console.log("Vault exists:", exists);
        setState(exists ? "unlock" : "setup");
      } catch (err) {
        console.error("Failed to check vault:", err);
        setDebugMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setState("setup");
      }
      setAttemptedCheck(true);
    };

    // Immediately try to check vault
    checkSetup();

    // Fallback timeout - after 3 seconds, show setup if we haven't transitioned yet
    const timeoutId = setTimeout(() => {
      if (!attemptedCheck) {
        console.log("Initialization timeout - defaulting to setup");
        setState("setup");
        setAttemptedCheck(true);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [attemptedCheck]);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      minHeight: "100vh",
      minWidth: "100vw",
      margin: 0,
      padding: 0,
      background: "#0f0f0f",
      overflow: "hidden"
    }}>
      {state === "loading" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0f0f0f",
          color: "#ffffff",
          gap: "20px"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Initializing...</div>
          <div style={{ fontSize: "14px", color: "#a0a0a0" }}>{debugMessage}</div>
          <div style={{ fontSize: "12px", color: "#606060" }}>This should take a few seconds</div>
        </div>
      )}
      {state === "setup" && (
        <SetupScreen onSetupComplete={() => setState("dashboard")} />
      )}
      {state === "unlock" && (
        <UnlockScreen onUnlock={() => setState("dashboard")} />
      )}
      {state === "dashboard" && (
        <Dashboard />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import UnlockScreen from "./components/UnlockScreen";
import SetupScreen from "./components/SetupScreen";
import Dashboard from "./components/Dashboard";
import { checkVaultExists } from "./services/api";

export default function App() {
  const [state, setState] = useState<"loading" | "setup" | "unlock" | "dashboard">("loading");
  const [debugMessage, setDebugMessage] = useState("Initializing...");

  useEffect(() => {
    const checkSetup = async () => {
      try {
        setDebugMessage("Checking vault...");
        const exists = await checkVaultExists();
        setState(exists ? "unlock" : "setup");
      } catch (err) {
        console.error("Failed to check vault:", err);
        setDebugMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Fallback to setup after 3 seconds
        setTimeout(() => setState("setup"), 3000);
      }
    };

    // Add a timeout to prevent hanging forever
    const timeoutId = setTimeout(() => {
      if (state === "loading") {
        setDebugMessage("Initialization timeout - defaulting to setup");
        setState("setup");
      }
    }, 10000);

    checkSetup();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {state === "loading" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0f0f0f",
          color: "#a0a0a0",
          gap: "20px"
        }}>
          <div style={{ fontSize: "16px" }}>Loading...</div>
          <div style={{ fontSize: "12px", color: "#606060" }}>{debugMessage}</div>
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
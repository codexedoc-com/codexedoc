import { useState, useEffect } from "react";
import UnlockScreen from "./components/UnlockScreen";
import SetupScreen from "./components/SetupScreen";
import Dashboard from "./components/Dashboard";
import { checkVaultExists } from "./services/api";

export default function App() {
  const [state, setState] = useState<"loading" | "setup" | "unlock" | "dashboard">("loading");

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const exists = await checkVaultExists();
        setState(exists ? "unlock" : "setup");
      } catch (err) {
        console.error("Failed to check vault:", err);
        setState("setup");
      }
    };

    checkSetup();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {state === "loading" && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0f0f0f",
          color: "#a0a0a0",
        }}>
          Loading...
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
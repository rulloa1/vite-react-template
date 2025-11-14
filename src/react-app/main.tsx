import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Simple test component
function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-4xl font-bold">
        ✅ React is Working!
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TestApp />
  </StrictMode>,
);

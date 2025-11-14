import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ControllerLayout } from "../components/ControllerLayout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ControllerLayout />
  </StrictMode>,
);

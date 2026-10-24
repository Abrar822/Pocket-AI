// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";

// import "./index.css";
// import App from "./App.jsx";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//       <App />
//   </StrictMode>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";

import "./index.css";
import App from "./App.jsx";
import { setApiBaseUrl } from "./config/api.js";

const root = document.getElementById("root");

async function startApp() {
  console.log("[Startup] React entry loaded");

  try {
    console.log("[Startup] Requesting backend URL...");

    const backendUrl = await invoke("get_backend_url");
    console.log("[Startup] Backend URL received:", backendUrl);

    setApiBaseUrl(backendUrl);

    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    console.log("[Startup] React render requested");
  } catch (error) {
    console.error("[Startup] Initialization failed:", error);

    root.innerText =
      "Pocket AI initialization failed:\n" + String(error);
  }
}

startApp();
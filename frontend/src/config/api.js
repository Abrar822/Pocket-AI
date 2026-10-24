
export let API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export function setApiBaseUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("Invalid backend URL received from Tauri");
  }

  API_BASE_URL = url.replace(/\/+$/, "");
}

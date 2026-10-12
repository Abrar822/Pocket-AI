const API_BASE_URL = "http://127.0.0.1:8000";

// Generic API function
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status}`
      );
    }

    return await response.json();

  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

// Send prompt to FastAPI
export async function sendPrompt(prompt) {
  return await apiRequest("/prompt", {
    method: "POST",

    body: JSON.stringify({
      prompt: prompt,
    }),
  });
}
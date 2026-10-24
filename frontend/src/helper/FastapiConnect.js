import { API_BASE_URL } from "../config/api";

export async function fastapiConnect(prompt) {
  let response = await fetch(`${API_BASE_URL}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
    }),
  });
  console.log(response)
  let data = await response.json();
  console.log(data);
  return data;
}
import { API_BASE_URL } from "../config/api";

export async function settingInsert(data) {
  let response = await fetch(`${API_BASE_URL}/insert_details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: data.username,
      wakeword: data.wakeword,
      mode: data.mode,
      voice: data.voice,
    }),
  });
  let res = await response.json()
  return res
}
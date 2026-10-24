import { API_BASE_URL } from "../config/api";

export function settingConnect() {
  return fetch(`${API_BASE_URL}/get_user_details`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .catch((err) => {
      return `Some Error occurred: ${String(err)}`;
    });
}
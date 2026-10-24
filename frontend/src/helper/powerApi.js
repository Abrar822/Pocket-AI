import { API_BASE_URL } from "../config/api";

const VALID_POWER_OPERATIONS = [
  "shutdown",
  "restart",
  "lock",
  "sleep",
  "hibernate",
];

export async function power(type) {
  const operation = type?.trim().toLowerCase();

  if (!VALID_POWER_OPERATIONS.includes(operation)) {
    throw new Error("Invalid power operation.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/power`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        power_type: operation,
      }),
    });
  } catch (error) {
    throw new Error(
      "Cannot connect to the backend. Check whether Friday's backend is running.",
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The backend returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.detail || `Power operation failed (${response.status}).`,
    );
  }

  return data;
}
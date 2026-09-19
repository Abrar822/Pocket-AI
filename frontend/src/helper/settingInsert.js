export async function settingInsert(data) {
  let response = await fetch("http://127.0.0.1:8000/insert_details", {
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

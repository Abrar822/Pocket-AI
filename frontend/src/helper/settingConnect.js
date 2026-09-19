export function settingConnect() {
  return fetch("http://127.0.0.1:8000/get_user_details")
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

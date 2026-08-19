export async function fastapiConnect(prompt) {
  let response = await fetch("http://127.0.0.1:8000/prompt", {
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
fastapiConnect("open youtube")
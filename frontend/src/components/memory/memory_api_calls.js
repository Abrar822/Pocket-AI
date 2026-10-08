export async function search(f_name) {
  let response = await fetch("http://127.0.0.1:8000/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      f_name: f_name,
    })
  });
  let data = await response.json();
  if (!response.ok) {
    throw new Error(`${data.detail}`);
  }
  return data;
}

export async function insert(folder_locations) {
  let response = await fetch('http://127.0.0.1:8000/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      folder_locations: folder_locations
    })
  })
  let data = await response.json()
  if(!response.ok) {
    throw new Error(`${data.detail}`)
  }
  return data
}

export async function display() {
  let response = await fetch('http://127.0.0.1:8000/display')
  let data = await response.json()
  if(!response.ok) {
    throw new Error(`${data.detail}`)
  }
  return data
}

export async function deleteFolders(folders) {
  let response = await fetch('http://127.0.0.1:8000/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      f_name: folders
    })
  })
  let data = await response.json()
  if(!response.ok) {
    throw new Error(`${data.detail}`)
  }
  return data
}
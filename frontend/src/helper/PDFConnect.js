async function PDF_upload(file) {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("http://127.0.0.1:8000/pdf/upload", {
        method: "POST",
        body: formData
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(`${data.detail}`)
    }
    return data
}

async function PDF_query(query) {
    const response = await fetch("http://127.0.0.1:8000/pdf/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: query
        }),
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(`${data.detail}`)
    }
    return data
}

async function PDF_delete() {
    const response = await fetch("http://127.0.0.1:8000/pdf/delete", {
        method: "DELETE",
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(`${data.detail}`)
    }
    return data
}
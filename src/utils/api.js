export async function uploadDocument(file, type) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", type); // optional if backend needs document type
  
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload document");
    }
  
    return await response.json();
  }
  
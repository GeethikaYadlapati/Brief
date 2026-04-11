export function chunkText(text: string): string[] {
    const chunkSize = 500
    const overlap = 50
    const chunks: string[] = []
  
    let start = 0
  
    while (start < text.length) {
      const end = start + chunkSize
      const chunk = text.slice(start, end)
      chunks.push(chunk)
      start = end - overlap
    }
  
    return chunks
  }
async function fetchChunk(url, start, end) {
    const response = await fetch(url, {
      headers: {
        'Range': `bytes=${start}-${end}`
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching chunk: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  }
  
  async function mergeChunks(url) {
    try {
      // Define los límites de cada chunk. Ejemplo: dos chunks de 0-499 y 500-999
      const chunk1 = await fetchChunk(url, 0, 499);
      const chunk2 = await fetchChunk(url, 500, 999);
  
      // Crea un ArrayBuffer lo suficientemente grande para almacenar ambos chunks
      const mergedArray = new Uint8Array(chunk1.byteLength + chunk2.byteLength);
  
      // Copia los datos del primer chunk
      mergedArray.set(new Uint8Array(chunk1), 0);
  
      // Copia los datos del segundo chunk
      mergedArray.set(new Uint8Array(chunk2), chunk1.byteLength);
  
      // Crea un Blob desde el ArrayBuffer resultante
      const blob = new Blob([mergedArray], { type: 'application/octet-stream' });
  
      // Para descargar el archivo resultante, puedes crear un enlace
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging chunks:', error);
    }
  }
  
  // Llamar a la función con la URL de tu API
  mergeChunks('https://example.com/api/archivo');
  
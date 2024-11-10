let currentChunkIndex = 0;

const playNextChunk = async() => {
    // Construct the absolute URL
    const url = new URL(`/getChunk/${currentChunkIndex}`, "http://localhost:3000");
    console.log(url);
    
    try {
        // Fetch the data from the constructed URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } 
        
        // Retrieve audio data as ArrayBuffer
        const chunkData = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Decode audio data from ArrayBuffer
        audioContext.decodeAudioData(chunkData, buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);

            // Increment the index for the next chunk
            currentChunkIndex++;
            // Wait 2 seconds before playing the next chunk
            setTimeout(playNextChunk, 2000);
        }, error => {
            console.error('Error decoding audio data:', error);
        });
    } catch (error) {
        console.error('Error fetching chunk:', error);
    }
}

// Initialize playback
playNextChunk();
import React, { useState, useRef } from 'react';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songId, setSongId] = useState('');
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const sourceListRef = useRef([]);
  const sourceDurationRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const chunkCount = 3;
  const sourceIndexRef = useRef(0);
  const host = 'http://localhost:5140';

  const fetchAudioSegment = async () => {
    const endpoint = `${host}/api/Song/download/indexed?songId=${songId}&index=${chunkIndexRef.current}`;
    chunkIndexRef.current++;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Error al obtener el segmento de audio');
    }
    return await response.arrayBuffer();
  };

  const buildSourceNodeFromBuffer = async (buffer) => {
    const audioContext = audioContextRef.current;
    try {
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      sourceDurationRef.current.push(audioBuffer.duration);
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContext.destination);
      sourceNode.onended = () => {
        if (isPlaying) {
          sourceIndexRef.current++;
          playStreaming();
        }
      };
      return sourceNode;
    } catch (error) {
      console.error('Error creando el nuevo source a partir de buffer de audio:', error);
      setIsPlaying(false);
    }
  };

  const prefetchAudio = async () => {
    try {
      for (let i = 0; i < chunkCount; i++) {
        const audioData = await fetchAudioSegment();
        const source = await buildSourceNodeFromBuffer(audioData);
        sourceListRef.current.push(source);
      }
    } catch (error) {
      console.error('Error al prellenar el buffer:', error);
    }
  };

  const playStreaming = async () => {
    try {
      if(sourceIndexRef.current >= sourceListRef.current.length)
      {
        console.log('Index at the end of the array buffer');
        setIsPlaying(false);
        return; 
      }
      const sourceNode = sourceListRef.current[sourceIndexRef.current];
      if (!sourceNode) {
        console.error('No hay más segmentos en el buffer');
        setIsPlaying(false);
        return;
      }

      sourceNode.start();
      const audioDuration = sourceDurationRef.current[sourceIndexRef.current] * 1000;
      const timeBeforeEnd = audioDuration - 10;

      setTimeout(() => {
          console.log('Changing playing chunk.');
          sourceIndexRef.current++;
          playStreaming();
      }, timeBeforeEnd);
    } catch (error) {
      console.error('Error en el streaming de audio:', error);
      setIsPlaying(false);
    }
  };

  const handlePlayClick = async () => {
    const audioContext = audioContextRef.current;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (!isPlaying) {
      setIsPlaying(true);
      chunkIndexRef.current = 0;
      sourceListRef.current.length = 0;
      // Fetch 2 chunks before start playing
      {
        const audioData1 = await fetchAudioSegment();
        const source1 = await buildSourceNodeFromBuffer(audioData1);
        sourceListRef.current.push(source1);
        
        const audioData2 = await fetchAudioSegment();
        const source2 = await buildSourceNodeFromBuffer(audioData2);
        sourceListRef.current.push(source2);
      }
      prefetchAudio();
      playStreaming();
    } else {
      setIsPlaying(false);
      if (sourceListRef.current[0]) {
        sourceListRef.current[0].stop();
      }
    }
  };

  return (
    <div>
      <h1>Streaming de Audio</h1>
      <label htmlFor="songId">Song ID:</label>
      <input
        type="text"
        id="songId"
        placeholder="Introduce el ID de la canción"
        value={songId}
        onChange={(e) => setSongId(e.target.value)}
      />
      <br />
      <br />
      <button onClick={handlePlayClick}>
        {isPlaying ? 'Detener Streaming' : 'Iniciar Streaming'}
      </button>
    </div>
  );
};

export default AudioPlayer;

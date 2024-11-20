import React, { useState, useRef, useEffect } from 'react';
import { requestToServer } from '../../utils/server';
import { getGenreNameById } from '../../utils/global';

const AudioPlayer = ({ songId, songCount }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [song, setSong] = useState(null);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const sourceListRef = useRef([]);
  const timerRef = useRef(null);
  const sourceDurationRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const chunkCount = songCount;
  const sourceIndexRef = useRef(0);
  const host = 'http://localhost:5140';

  const getSong = (event = null) => {
    console.log(songId)
    requestToServer("GET", `/Song?limit=1&id=${songId}`, null, async (d) => {
      console.log(d)
      const ele = d.value[0]
      let y = [null, null]
      if (ele.albumId) {
        await requestToServer("GET", `/Album?limit=1&id=${ele.albumId}`, null, (d) => {
            y[0] = d.value[0];
        }, (e) => {
            console.error(e);
            return null;
        });
      }
      if (ele.authorId) {
          await requestToServer("GET", `/Author?limit=1&id=${ele.authorId}`, null, (d) => {
              y[1] = d.value[0];
          }, (e) => {
              console.error(e);
              return null;
          });  
      }
      console.log(ele, y)
      setSong({
          ...ele
      })
        setSong(d.value[0])
      }, (e) => {
        console.error(e)
      })
  };

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
      if (sourceIndexRef.current >= sourceListRef.current.length) {
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

      timerRef.current = setTimeout(() => {
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
      clearTimeout(timerRef.current); 
      if (sourceListRef.current[sourceIndexRef.current]) {
        sourceListRef.current[sourceIndexRef.current].stop();
      }
    }
  };

  useEffect(() => {
    getSong()
  }, songId)
console.log(song)
  return (
    <div className='rep'>
      <div onClick={handlePlayClick}>
        <div className='cursor'>
          {isPlaying ? 
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-pause" viewBox="0 0 16 16">
            <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>
          </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-play" viewBox="0 0 16 16">
            <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
          </svg>}
        </div>
        

          <p className='h3'>{song ? song.name : <></>}</p>
          <p className='h3'>{song ? song.author : <></>}</p>
          <p className='h3'>{song ? song.album : <></>}</p>
      </div>
    </div>
  );
};

export default AudioPlayer;

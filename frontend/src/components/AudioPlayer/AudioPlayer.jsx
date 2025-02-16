import React, { useState, useRef, useEffect, useContext } from 'react';
import { requestToServer } from '../../utils/server';
import { getGenreNameById } from '../../utils/global';
import { BackendService } from '../../utils/backend';
import { createStore } from 'redux';
import { MiContexto } from '../../App';

const AudioPlayer = ({ songId,  songCount }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [song, setSong] = useState(null);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const sourceListRef = useRef([]);
  const timerRef = useRef(null);
  const sourceDurationRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const chunkCount = songCount;
  const sourceIndexRef = useRef(0); 
  const backendService = new BackendService()


  // Crear el store
  const store = createStore((state, action) => {
    switch (action.type) {
      case 'SET_SONG_CHUNKS':
        return {
          ...state,
          songChunks: {
            ...state.songChunks,
            [action.payload.songId]: action.payload.newChunks
          }
        };
      default:
        return state;
    }
  }, { songChunks: {} });

  // En tu componente
  useEffect(() => {
    const updateSongChunks = async (newChunks) => {
      store.dispatch({
        type: 'SET_SONG_CHUNKS',
        payload: {
          songId: songId,
          newChunks: newChunks
        }
      });
    setSongChunks({})
    };

    // Llama a updateSongChunks cada vez que necesites actualizar los chunks
  }, []);


  const getSong = (event = null) => {
    backendService.getSongs(`?limit=1&id=${songId}`, async (d) => {
      const ele = d.value[0]
      let y = [null, null]
      if (ele.albumId) {
        await backendService.getAlbums(`?limit=1&id=${ele.albumId}`, (d) => {
            y[0] = d.value[0];
        }, (e) => {
            console.error(e);
            return null;
        });
      }
      if (ele.authorId) {
          await backendService.getAuthors(`?limit=1&id=${ele.authorId}`, (d) => {
              y[1] = d.value[0];
          }, (e) => {
              console.error(e);
              return null;
          });  
      }
      // console.log(ele, y)
      setSong(ele);
        setSong(d.value[0])
      }, (e) => {
        console.error(e)
      })
  };

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
  }
  
//   const fetchAudioSegment = async () => {
//     console.log("Solicitando chunk:", chunkIndexRef.current);
    
//     // Recuperar segmentos almacenados en localStorage
//     let songChunks = [];
//     const storedChunks = JSON.parse(localStorage.getItem(songId)) || [];
    
//     if (storedChunks.length > 0) {
//       songChunks = storedChunks.map(base64ToArrayBuffer);
//         console.log(songChunks)
//       if (storedChunks[chunkIndexRef.current]) {
//         return storedChunks[chunkIndexRef.current]
//       }
//     }

//     let chunk = null;
//     const currentChunkIndex = chunkIndexRef.current; // Guardamos el índice actual
//     const endpoint = `?songId=${songId}&index=${currentChunkIndex}`;

//     chunkIndexRef.current++; // Incrementamos el índice para la próxima solicitud

//     await backendService.getSongAudio(endpoint, (response) => {
//         songChunks[currentChunkIndex] = response; // Guardamos en el índice correcto

//         // Convertimos a Base64 y guardamos en localStorage
//         const base64Chunks = songChunks.map(arrayBufferToBase64);
//         localStorage.setItem(songId, JSON.stringify(base64Chunks));

//         console.log("Chunk recibido:", currentChunkIndex, response);
//         chunk = response;
//     }, (e) => {
//         console.error('Error al obtener el segmento de audio', e);
//         throw new Error('Error al obtener el segmento de audio');
//     });

//     return chunk;
// };




// Función para abrir o crear la base de datos IndexedDB



// Función para abrir o crear la base de datos IndexedDB


const openDatabase = () => {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open("miBaseDeDatos", 1);

      request.onerror = (event) => {
          console.error("Error al abrir la base de datos:", event);
          reject(event);
      };

      request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore("audioChunks", { keyPath: "id" });
      };

      request.onsuccess = (event) => {
          resolve(event.target.result);
      };
  });
};
const storeChunk = async (db, songId, chunkIndex, chunk) => {
  const transaction = db.transaction("audioChunks", "readwrite");
  const objectStore = transaction.objectStore("audioChunks");

  const data = { id: songId + chunkIndex, chunk: chunk };

  const request = objectStore.put(data);
  
  request.onsuccess = () => {
      console.log("Chunk almacenado con éxito:", chunkIndex);
  };

  request.onerror = (event) => {
      console.error("Error al almacenar el chunk:", event);
  };
};
const fetchChunk = async (db, songId, chunkIndex) => {
  return new Promise((resolve, reject) => {
      const transaction = db.transaction("audioChunks", "readonly");
      const objectStore = transaction.objectStore("audioChunks");
      const request = objectStore.get(songId + chunkIndex);

      request.onsuccess = (event) => {
          if (event.target.result) {
              resolve(event.target.result.chunk);
          } else {
              resolve(null); // No encontrado
          }
      };

      request.onerror = (event) => {
          console.error("Error al recuperar el chunk:", event);
          reject(event);
      };
  });
};
const fetchAudioSegment = async () => {
  console.log("Solicitando chunk:", chunkIndexRef.current);

  const db = await openDatabase();
  const storedChunk = await fetchChunk(db, songId, chunkIndexRef.current);

  if (storedChunk) {
    console.log(songId, chunkIndexRef.current, storeChunk)
    chunkIndexRef.current++;
    return storedChunk; // Retornar el chunk almacenado
  }

  let chunk = null;
  const currentChunkIndex = chunkIndexRef.current;
  const endpoint = `?songId=${songId}&index=${currentChunkIndex}`;

  chunkIndexRef.current++;

  await backendService.getSongAudio(endpoint, async (response) => {
      await storeChunk(db, songId, currentChunkIndex, response); // Almacena el chunk
      chunk = response;
      console.log("Chunk recibido:", currentChunkIndex, response);
  }, (e) => {
      console.error('Error al obtener el segmento de audio', e);
      throw new Error('Error al obtener el segmento de audio');
  });

  return chunk;
};





  // const fetchAudioSegment = async () => {
  //   console.log(songChunks)
  //   if (songChunks[songId] && songChunks[songId][chunkIndexRef.current]) {
  //     return songChunks[songId][chunkIndexRef.current]
  //   }
  //   let chunk = null
  //   const endpoint = `?songId=${songId}&index=${chunkIndexRef.current}`;
  //   chunkIndexRef.current++;
  //   await backendService.getSongAudio(endpoint, async (response) => { 
  //     chunk = response;
  //   }, (e) => {
  //     throw new Error('Error al obtener el segmento de audio');
  //   })

  //   return chunk
  // };

  // const fetchAudioSegment = async () => {
  //   console.log(chunkIndexRef.current)
  //   if (songChunks[songId]) {
  //     // return songChunks[songId][chunkIndexRef.current]
  //   }
  //   let chunk = null
  //   const endpoint = `?songId=${songId}&index=${chunkIndexRef.current}`;
  //   chunkIndexRef.current++;
  //   await backendService.getSongAudio(endpoint, async (response) => {
  //     let arrt = songChunks[songId] || []
  //     console.log(arrt, response, chunkIndexRef.current)
  //     arrt[chunkIndexRef.current] = response
  //     chunk = response;
  //     // setSongChunks(prev => ({
  //     //   ...prev,
  //     //   [songId]: arrt
  //     // }))
  //     updateSongChunks(arrt)
  //   }, (e) => {
  //     throw new Error('Error al obtener el segmento de audio');
  //   })

  //   return chunk
  // };

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
        // let a = songChunks[songId] || []
        // for (let index = 0; index < sourceListRef.current.length; index++) {
        //   const element = sourceListRef.current[index];
        //   if (element) {
        //     a[index] = element
        //   }
        // }
        // setSongChunks(prev => ({
        //   ...prev,
        //   [songId]: a
        // }))
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
  }, [songId])
  return (
    <div className='rep'>
      <div onClick={handlePlayClick} className='d-flex'>
        <div className='cursor'>
          {isPlaying ? 
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-pause" viewBox="0 0 16 16">
            <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>
          </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-play" viewBox="0 0 16 16">
            <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
          </svg>}
        </div>
        

          <p className='h3'>id: {song ? song.id : <></>}</p>
          <p className='h3'>{song ? song.author : <></>}</p>
          <p className='h3'>{song ? song.album : <></>}</p>
      </div>
    </div>
  );
};

export default AudioPlayer;



class Mutex {
  constructor() {
    this.locked = false;
    this.queue = [];
  }

  lock() {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.locked = false;
    }
  }
}
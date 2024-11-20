import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Filters from '../components/Filters/Filters';
import Add from './add';
import Edit from './edit';
import { requestToServer } from '../utils/server';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer'; // Importa el componente AudioPlayer

const Song = () => {
  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState([]);
  const [reload, setReload] = useState(false);
  const [id, setId] = useState(null);
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentChunkCount, setCurrentChunkCount] = useState(null); 

  const handleChangePage = (direction) => {
    if (direction === 'next') {
      setPage((prevPage) => prevPage + 1);
    } else if (direction === 'prev') {
      setPage((prevPage) => prevPage - 1);
    }
  };
name
  const deleted = (id) => {
    requestToServer(
      'DELETE',
      `/Song?SongId=${id}`,
      null,
      (d) => {
        setReload(!reload);
      },
      (e) => {
        console.log(e);
      }
    );
  };

  const start = () => {
    // Código de edición
  };

  useEffect(() => {
    if (songs.length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [songs]);

  return (
    <div className="">
      <Navbar />
{currentSongId && (
          <div className="mt-4">
            {/* <h4>Reproduciendo canción ID: {currentSongId}</h4> */}
            <AudioPlayer songId={currentSongId}  songCount={currentChunkCount}/>
          </div>
        )}
      <div className="container my-5">
        <h2 className="text-center mb-4">Buscar Canciones</h2>
        <Add reload={() => setReload(!reload)} />

        <Filters setSongs={setSongs} page={page} reload={reload} />
       
        

        <div className="mt-5">
          <h3 className="text-center mb-4">Resultados de Búsqueda</h3>
          <table className="table table-striped">
            <thead id="songs">
              <tr>
                <th scope="col"></th>
                <th scope="col">Nombre de la Canción</th>
                <th scope="col">Autor</th>
                <th scope="col">Género</th>
                <th scope="col">Álbum</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody id="songs">
              {songs.map((ele, index) => (
                <tr key={index}>
                  <td
                    className="cursor"
                    onClick={() => {
                      setCurrentSongId(ele.id)
                      setCurrentChunkCount(ele.chunksCount)
                    }} 
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-play" viewBox="0 0 16 16">
                      <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
                    </svg>
                  </td>
                  <td>{ele.name}</td>
                  <td>{ele.author ? ele.author.name : <></>}</td>
                  <td>{ele.genre ? ele.genre.name : <></>}</td>
                  <td>{ele.album ? ele.album.name : <></>}</td>
                  <td
                    className="cursor"
                    data-bs-toggle="modal"
                    data-bs-target="#modalEditarCancion"
                    onClick={() => setId(ele.id)}
                  >
                    editar
                  </td>
                  <td className="cursor" onClick={() => deleted(ele.id)}>
                    borrar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {songs.length !== 0 ? (
            <div className="container d-flex justify-content-center">
              {page > 1 ? (
                <button className="btn btn-primary me-3" onClick={() => handleChangePage('prev')}>
                  Atras
                </button>
              ) : (
                <></>
              )}
              <p className="h3 me-3">{page}</p>
              <button className="btn btn-primary me-3" onClick={() => handleChangePage('next')}>
                Siguiente
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      <Edit id={id} reload={() => setReload(!reload)} />
    </div>
  );
};

export default Song;

import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Filters from '../components/Filters/Filters'
import Add from './add'
import { requestToServer } from '../utils/server'
import Edit from './edit'


const Song = () => {
  const [page, setPage] = useState(1)
  const [songs, setSongs] = useState([])
  const [reload, setReload] = useState(false)
  const [id, setId] = useState(null)

  const startSong = (id) => {
    requestToServer("GET", `/Song/download?songId=${id}`, null, (d) => {
      setAuthors(d.value)
    }, (e) => {
        console.log(e)
    })
  }

  const handleChangePage = (direction) => {
    if (direction === 'next') {
      setPage(prevPage => prevPage + 1)
    } else if (direction === 'prev') {
      setPage(prevPage => prevPage - 1)
    }
  }

  const deleted = (id) => {
    requestToServer("DELETE", `/Song?SongId=${id}`, null, (d) => {
      setReload()
    }, (e) => {
        console.log(e)
    })
  } 

  const edit = () => {

  }

  useEffect(() => {
    if (songs.length == 0 && page > 1) {
      setPage(page - 1)
    }
  }, [songs])

  return (
    <div className="">
      <Navbar/>

      <div className="container my-5">
        <h2 className="text-center mb-4">Buscar Canciones</h2>
        <Add reload={() => setReload(!reload)}/>
        
        <Filters setSongs={setSongs} page={page} reload={reload}/>
      
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
            <tbody  id="songs">
              {songs.map((ele, index) => (
                <tr key={index}>
                  <td onClick={() => startSong(ele.id)}>Reproducir</td>
                  <td>{ele.name}</td>
                  <td>{ele.author ? ele.author.name : <></>}</td>
                  <td>{ele.genre ? ele.genre.name : <></>}</td>
                  <td>{ele.album ? ele.album.name : <></>}</td>
                  <td className='cursor' data-bs-toggle="modal" data-bs-target="#modalEditarCancion" onClick={() => setId(ele.id)}>editar</td>
                  <td className='cursor' onClick={() => deleted(ele.id)}>borrar</td>
                </tr> 
              ))}
            </tbody>
          </table>
          {songs.length != 0 ? 
          <div className='container d-flex justify-content-center'>
            {page > 1 ? 
              <button className='btn btn-primary me-3' onClick={() => handleChangePage('prev')}>Atras</button> : <></>}
            <p className='h3 me-3'>{page}</p>
              <button className='btn btn-primary me-3' onClick={() => handleChangePage('next')}>Siguiente</button>
          </div> : <></> }
        </div>
      </div>
      <Edit id={id} reload={() => setReload(!reload)}/>
    </div>
  )
}

export default Song

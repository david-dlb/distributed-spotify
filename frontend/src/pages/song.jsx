import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Filters from '../components/Filters/Filters'


const Song = () => {
  const [page, setPage] = useState(0)
  const [songs, setSongs] = useState([])

  const startSong = (id) => {
    requestToServer("GET", `/Song/download?songId=${id}`, null, (d) => {
      setAuthors(d.value)
    }, (e) => {
        console.log(d)
    })
  }

  const handleChangePage = (direction) => {
    if (direction === 'next') {
      setPage(prevPage => prevPage + 1)
    } else if (direction === 'prev') {
      setPage(prevPage => prevPage - 1)
    }
  }

  useEffect(() => {
    if (songs.length > 0) {
      setPage(1)
    }
    if (songs.length == 0 && page > 0) {
      setPage(page - 1)
    }
  }, [songs])

  return (
    <div className="">
      <Navbar/>

      <div className="container my-5">
    <h2 className="text-center mb-4">Buscar Canciones</h2>
    
    <Filters setSongs={setSongs} page={page}/>
  
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
          </tr>
        </thead>
        <tbody  id="songs">
          {songs.map(ele => (
            <tr>
              <td onClick={() => startSong(ele.id)}>Reproducir</td>
              <td>{ele.name}</td>
              <td>{ele.author}</td>
              <td>{ele.genre}</td>
              <td>{ele.album}</td>
            </tr> 
          ))}
        </tbody>
      </table>
      {page != 0 ? 
      <div className='container d-flex justify-content-center'>
        {page > 1 ? 
          <button className='btn btn-primary me-3' onClick={() => handleChangePage('prev')}>Atras</button> : <></>}
        <p className='h3 me-3'>{page}</p>
        {page > 0 ? 
          <button className='btn btn-primary me-3' onClick={() => handleChangePage('next')}>Siguiente</button> : <></>}
      </div> : <></> }
    </div>
  </div>

    </div>
  )
}

export default Song

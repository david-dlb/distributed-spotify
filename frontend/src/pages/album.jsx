import React, { useEffect, useState } from 'react'
import { requestToServer, requestToServerForm } from '../utils/server';
import { genres } from '../utils/global';
import Navbar from '../components/Navbar/Navbar';


const Album = () => {
  const [albumName, setAlbumName] = useState('');
  const [albums, setAlbums] = useState([])  
  const [page, setPage] = useState(1)
  

  const addAlbum = (e) => {
    e.preventDefault()
    const data = {
      "name": albumName
    } 
    requestToServer("POST", `/Album`, data, (d) => {
      console.log(d)
      setAlbumName("")
      getAlbums()
      setPage(1)
    }, (err) => {
      console.log(err)
    })
  }

  const getAlbums = async () => {
    requestToServer("GET", `/Album?limit=${10}&page=${page - 1}`, null, (d) => {
      setAlbums(d.value) 
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
    requestToServer("DELETE", `/Album?AlbumId=${id}`, null, (d) => {
      getAlbums()
    }, (e) => {
        console.log(e)
    })
  } 

  useEffect(() => {
    getAlbums()
  }, [page])
  useEffect(() => {
    getAlbums()
  }, [])

  useEffect(() => {
    if (albums.length > 0) {
      // setPage(1)
    }
    if (albums.length == 0 && page > 0) {
      setPage(page - 1)
    }
  }, [albums])

  return (
    <div className="">
      <Navbar/>
      <div className="container my-5">
        <h2 className="text-center">Agregar Album</h2>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgregarAlbum">Agregar Álbum</button>
        </div>
      </div>

      <div className="modal fade" id="modalAgregarAlbum" tabIndex="-1" aria-labelledby="modalAgregarAlbumLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalAgregarAlbumLabel">Agregar Álbum</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="album" onSubmit={addAlbum}>
                <div className="mb-3">
                  <label htmlFor="nombreAlbum" className="form-label">Nombre del Álbum</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="name" 
                    id="nombreAlbum" 
                    value={albumName} 
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="Introduce el nombre del álbum"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div>
        <table className="table table-striped container">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {albums.map((ele, index) => (
              <tr key={index}>
                <td>{ele.name}</td>
                <td className='cursor' onClick={() => deleted(ele.id)}>borrar</td>
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
  )
}

export default Album

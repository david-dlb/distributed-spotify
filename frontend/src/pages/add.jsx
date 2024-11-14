import React, { useState } from 'react'
import { requestToServer } from '../utils/server';


const Add = () => {
  const [count, setCount] = useState(0)
  const [albumName, setAlbumName] = useState('');

  const addAlbum = (e) => {
    e.preventDefault()
    const data = {
      "name": albumName
    }
    console.log(data)
    requestToServer("POST", `http://localhost:5140/api/Album`, data, (d) => {
      console.log(d)
    }, (e) => {
          console.log(d)
      })
  }

  return (
    <div className="">
      
<div className="container my-5">
  <h2 className="text-center">Modales de Agregar</h2>
  <div className="d-flex justify-content-center gap-3 mt-4">
    <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgregarAlbum">Agregar Álbum</button>
    <button className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#modalAgregarAutor">Agregar Autor</button>
    <button className="btn btn-success" data-bs-toggle="modal" id="add-song" data-bs-target="#modalAgregarCancion">Agregar Canción</button>
  </div>
</div>

<div className="modal fade" id="modalAgregarAlbum" tabindex="-1" aria-labelledby="modalAgregarAlbumLabel" aria-hidden="true">
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

<div className="modal fade" id="modalAgregarAutor" tabindex="-1" aria-labelledby="modalAgregarAutorLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="modalAgregarAutorLabel">Agregar Autor</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <form id="author">
          <div className="mb-3">
            <label for="nombreAutor" className="form-label">Nombre del Autor</label>
            <input type="text" className="form-control" name="name" id="nombreAutor" placeholder="Introduce el nombre del autor"/>
          </div>
          <button type="submit" className="btn btn-secondary">Guardar</button>
        </form>
      </div>
    </div>
  </div>
</div>

<div className="modal fade" id="modalAgregarCancion" tabindex="-1" aria-labelledby="modalAgregarCancionLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="modalAgregarCancionLabel">Agregar Canción</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <form id="song">
          <div className="mb-3">
            <label for="nombreCancion" className="form-label">Nombre de la Canción</label>
            <input type="text" className="form-control" name="Name" id="nombreCancion" placeholder="Introduce el nombre de la canción"/>
          </div>
          <div className="mb-3">
            <label for="nombreCancion" className="form-label">Autor</label>
            <select name="autor" id="autor">
              <option className="form-control" value="as">lafk</option>
            </select>
          </div>
          <div className="mb-3">
            <label for="nombreCancion" className="form-label">Album</label>
            <select name="album" id="album">
              <option className="form-control" value="as">lafk</option>
            </select>
          </div>
          <div className="mb-3">
            <label for="nombreCancion" className="form-label">Genero</label>
            <select name="genero" id="genero">
              <option className="form-control" value="as">lafk</option>
            </select>
          </div>
          <div className="mb-3">
            <label for="nombreCancion" className="form-label">archivo</label>
            <input type="file" className="form-control" name="file" id="nombreCancion" placeholder="Introduce el nombre de la canción"/>
          </div>
          <button type="submit" className="btn btn-success">Guardar</button>
        </form>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}

export default Add

import React, { useState } from 'react'
import { requestToServer, requestToServerForm } from '../utils/server';


const Add = () => {
  const [count, setCount] = useState(0)
  const [albumName, setAlbumName] = useState('');
  const [formData, setFormData] = useState({
    Name: '',
    AuthorId: '',
    AlbumId: '',
    Genre: '',
    SongFile: null
  });
  const [authorName, setAuthorName] = useState('');
  const [albums, setAlbums] = useState([])
  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([
        "Rock",
        "Pop",
        "Jazz",
        "Blues",
        "Classical",
        "HipHop",
        "Electronic",
        "Country",
        "Reggae",
        "Metal",
        "Punk",
        "Funk",
        "Soul",
        "RnB",
        "Disco",
        "Folk",
        "Indie",
        "Latin",
        "Rap",
        "House",
        "Techno",
        "Dance",
        "Ambient",
        "Trance",
        "Dubstep",
        "Gospel",
        "Opera",
        "Grunge",
        "Ska",
        "Reggaeton",
        "Swing",
        "Synthpop",
        "KPop",
        "Unknow"
  ])
  

  const addAlbum = (e) => {
    e.preventDefault()
    const data = {
      "name": albumName
    } 
    requestToServer("POST", `http://localhost:5140/api/Album`, data, (d) => {
      console.log(d)
      setAlbumName("")
    }, (e) => {
          console.log(d)
      })
  }

  const addAuthor = (e) => {
    e.preventDefault()
    const data = {
      "name": authorName
    } 
    requestToServer("POST", `http://localhost:5140/api/Author`, data, (d) => {
      console.log(d)
      setAuthorName("")
    }, (e) => {
          console.log(d)
      })
  }
  
  const addSong = (e) => {
    e.preventDefault()
    console.log(formData)
    const data = new FormData();
data.append('songFile', new File([formData.SongFile], 'FormatFactory05 - Me derrumbo.mp3', { type: 'audio/mpeg' }));
data.append('AlbumId', '37bdc78c-b077-43e8-8122-5ec115a8adcc');
data.append('AuthorId', '1ce8ddaa-0cee-4a08-89e2-23f48bb65f66');
data.append('Genre', '1');
data.append('Name', 'ad');

fetch('http://localhost:5140/api/Song', {
  method: 'POST',
  headers: {
    'accept': 'text/plain',
  },
  body: data,
})
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));


  }

  const getAlbums = async () => {
    requestToServer("GET", `http://localhost:5140/api/Album?limit=${1000000}`, null, (d) => {
      setAlbums(d.value)
      setFormData({
        ...formData,
        ["AlbumId"]: d.value[0].id
      });
    }, (e) => {
        console.log(d)
    })
  }
  const getAuthors = async () => {
    requestToServer("GET", `http://localhost:5140/api/Author?limit=${1000000}`, null, (d) => {
      setAuthors(d.value)
      console.log(d.value)
      setFormData({
        ...formData,
        ["AuthorId"]: d.value[0].id
      });
    }, (e) => {
        console.log(d)
    })
  }

  const handleInputChange = (e) => {
    
  };
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const modalSong = () => {
    getAuthors()
    getAlbums()
  }

  return (
    <div className="">
      
<div className="container my-5">
  <h2 className="text-center">Modales de Agregar</h2>
  <div className="d-flex justify-content-center gap-3 mt-4">
    <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgregarAlbum">Agregar Álbum</button>
    <button className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#modalAgregarAutor">Agregar Autor</button>
    <button className="btn btn-success" data-bs-toggle="modal" onClick={modalSong} id="add-song" data-bs-target="#modalAgregarCancion">Agregar Canción</button>
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
      <form id="author" onSubmit={addAuthor}>
          <div className="mb-3">
            <label htmlFor="nombreAuthor" className="form-label">Nombre del Álbum</label>
            <input 
              type="text" 
              className="form-control" 
              name="name" 
              id="nombreAuthor" 
              value={authorName} 
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Introduce el nombre del álbum"
            />
          </div>
          <button type="submit" className="btn btn-primary">Guardar</button>
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
        <form id="song" onSubmit={addSong}>
          <div className="mb-3">
            <label htmlFor="nombreCancion" className="form-label">Nombre de la Canción</label>
            <input 
              type="text" 
              className="form-control" 
              name="songName"
              id="nombreCancion"
              value={formData.songName}
              onChange={handleInputChange}
              placeholder="Introduce el nombre de la canción"
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="autor" className="form-label">Autor</label>
            <select 
              name="authorId" 
              id="autor"
              value={formData.authorId}
              onChange={handleInputChange}
            >
              {authors.map(ele => (
                <option key={ele.id} value={ele.id}>{ele.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="album" className="form-label">Album</label>
            <select 
              name="albumId"
              id="album"
              value={formData.albumId}
              onChange={handleInputChange}
            >
              {albums.map(ele => (
                <option key={ele.id} value={ele.id}>{ele.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="genero" className="form-label">Genero</label>
            <select 
              name="Genre"
              id="Genre"
              value={1}
              onChange={handleInputChange}
            >
              {genres.map(ele => (
                <option key={ele.id} value={ele}>{ele}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="nombreCancion" className="form-label">Archivo</label>
            <input 
              type="file" 
              className="form-control" 
              name="file"
              id="nombreCancion"
              onChange={handleFileChange}
            />
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

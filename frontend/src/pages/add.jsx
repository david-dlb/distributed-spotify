import React, { useEffect, useState } from 'react'
import { baseUrl, requestToServer, requestToServerForm } from '../utils/server';
import { genres } from '../utils/global';
import Navbar from '../components/Navbar/Navbar';


const Add = () => {
  const [count, setCount] = useState(0)
  const [albumName, setAlbumName] = useState('');
  const [formData, setFormData] = useState({
    Name: '',
    AuthorId: '',
    AlbumId: '',
    Genre: genres[0].id,
    SongFile: null
  });
  const [authorName, setAuthorName] = useState('');
  const [albums, setAlbums] = useState([])
  const [authors, setAuthors] = useState([])
  
  

  const addAlbum = (e) => {
    e.preventDefault()
    const data = {
      "name": albumName
    } 
    requestToServer("POST", `/Album`, data, (d) => {
      console.log(d)
      setAlbumName("")
    }, (err) => {
          console.log(err)
      })
  }

  const addAuthor = (e) => {
    e.preventDefault()
    const data = {
      "name": authorName
    } 
    requestToServer("POST", `/Author`, data, (d) => {
      console.log(d)
      setAuthorName("")
    }, (err) => {
          console.log(e)
      })
  }
  
  const addSong = (e) => {
    e.preventDefault()
    console.log(formData)
    const data = new FormData();
    data.append('songFile', new File([formData.SongFile], null, { type: 'audio/mpeg' }));
    data.append('AlbumId', formData.AlbumId);
    data.append('AuthorId', formData.AuthorId);
    data.append('Genre', formData.Genre);
    data.append('Name', formData.Name);

    fetch(`${baseUrl}/Song`, {
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
    requestToServer("GET", `/Album?limit=${1000000}`, null, (d) => {
      setAlbums(d.value) 
    }, (e) => {
        console.log(d)
    })
  }
  const getAuthors = async () => {
    requestToServer("GET", `/Author?limit=${1000000}`, null, (d) => {
      setAuthors(d.value) 
    }, (e) => {
        console.log(d)
    })
  }

  const handleInputChange = (e) => { 
    const { name, value } = e.target;
     
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
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


  useEffect(() => {
    if (albums.length > 0) {
      setFormData(prevFormData => ({
        ...prevFormData,
        "AlbumId": albums[0].id
      }));
      
    }
  }, [albums]);
  useEffect(() => {
    if (authors.length > 0) {
      setFormData(prevFormData => ({
        ...prevFormData,
        "AuthorId": authors[0].id
      }));
    }
  }, [authors])

  return (
    <div className="">
      <Navbar/>
      <div className="container my-5">
        <h2 className="text-center">Modales de Agregar</h2>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgregarAlbum">Agregar Álbum</button>
          <button className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#modalAgregarAutor">Agregar Autor</button>
          <button className="btn btn-success" data-bs-toggle="modal" onClick={modalSong} id="add-song" data-bs-target="#modalAgregarCancion">Agregar Canción</button>
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

      <div className="modal fade" id="modalAgregarAutor" tabIndex="-1" aria-labelledby="modalAgregarAutorLabel" aria-hidden="true">
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

      <div className="modal fade" id="modalAgregarCancion" tabIndex="-1" aria-labelledby="modalAgregarCancionLabel" aria-hidden="true">
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
                    name="Name"
                    id="nombreCancion"
                    value={formData.songName}
                    onChange={handleInputChange}
                    placeholder="Introduce el nombre de la canción"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="autor" className="form-label">Autor</label>
                  <select 
                    name="AuthorId" 
                    id="autor"
                    value={formData.AuthorId}
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
                    name="AlbumId"
                    id="album"
                    value={formData.AlbumId}
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
                    value={formData.Genre}
                    onChange={handleInputChange}
                  >
                    <option value={null} selected disabled>Seleccionar genero</option>
                    {genres.map(ele => (
                      <option key={ele.id} value={ele.id}>{ele.name}</option>
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

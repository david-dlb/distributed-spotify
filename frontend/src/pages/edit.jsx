import React, { useEffect, useState } from 'react'
import { baseUrl, requestToServer, requestToServerForm } from '../utils/server';
import { genres } from '../utils/global';
import Navbar from '../components/Navbar/Navbar';
import { handleErrorWithSweetAlert } from '../utils/alert';


const Edit = ({ setSongs, reload }) => {
  const [formData, setFormData] = useState({
    Name: '',
    AuthorId: '',
    AlbumId: '',
    Genre: genres[0].id,
    SongFile: null
  });
  const [albums, setAlbums] = useState([])
  const [authors, setAuthors] = useState([])
  
  

  
  const addSong = (e) => {
    e.preventDefault()
    console.log(formData)
    const data = new FormData();
    data.append('songFile', new File([formData.SongFile], null, { type: 'audio/mpeg' }));
    data.append('AlbumId', formData.AlbumId);
    data.append('AuthorId', formData.AuthorId);
    data.append('Genre', formData.Genre);
    data.append('Name', formData.Name);

    requestToServerForm("POST", "/Song", data, (d) => {
      console.log(d)
      setFormData({
        Name: '',
        AuthorId: '',
        AlbumId: '',
        Genre: genres[0].id,
        SongFile: null
      });
      reload()
    }, (e) => {})
  }

  const getAlbums = async () => {
    requestToServer("GET", `/Album?limit=${1000000}`, null, (d) => {
      setAlbums(d.value) 
    }, (e) => {
        console.log(e)
    })
  }
  const getAuthors = async () => {
    requestToServer("GET", `/Author?limit=${1000000}`, null, (d) => {
      setAuthors(d.value) 
    }, (e) => {
        console.log(e)
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

      <div className="modal fade" id="modalEditarCancion" tabIndex="-1" aria-labelledby="modalEditarCancionLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalEditarCancionLabel">Editar Canción</h5>
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

export default Edit

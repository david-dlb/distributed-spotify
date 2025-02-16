import React, { useEffect, useState } from 'react'
import { requestToServer, requestToServerForm } from '../utils/server';
import { genres } from '../utils/global';
import Navbar from '../components/Navbar/Navbar';
import { handleErrorWithSweetAlert } from '../utils/alert';
import { BackendService } from '../utils/backend';


const Add = ({ setSongs, reload }) => {
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
  const backendService = new BackendService()
  
  

  
  const addSong = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    (formData)
    const data = new FormData();
    data.append('songFile', new File([formData.SongFile], null, { type: 'audio/mpeg' }));
    data.append('AlbumId', formData.AlbumId);
    data.append('AuthorId', formData.AuthorId);
    data.append('Genre', formData.Genre);
    data.append('Name', formData.Name);

    backendService.setSong("POST", data, (d) => {
      (d)
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
    backendService.getAlbums( `?limit=${1000000}`, (d) => {
      setAlbums(d.value) 
    }, (e) => {
        (e)
    })
  }
  const getAuthors = async () => {
    backendService.getAuthors(`?limit=${1000000}`, (d) => {
      setAuthors(d.value) 
    }, (e) => {
        (e)
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
      SongFile: e.target.files[0]
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
      <div className="container my-5">
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-success" onClick={modalSong} id="add-song" data-bs-toggle="modal" data-bs-target="#modalAgregarCancion">Agregar Canción</button>
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
                  <label htmlFor="Género" className="form-label">Género</label>
                  <select 
                    name="Genre"
                    id="Genre"
                    value={formData.Genre}
                    onChange={handleInputChange}
                  >
                    <option value={null} selected disabled>Seleccionar Género</option>
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

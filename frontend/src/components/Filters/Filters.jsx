import React, { useEffect, useState } from 'react'
import { requestToServer } from '../../utils/server';
import { genres } from '../../utils/global';


const Filters = ({ setSongs }) => {
    const [page, setPage] = useState(0)
    const [albums, setAlbums] = useState([])
    const [authors, setAuthors] = useState([])
    const [formData, setFormData] = useState({
        Name: '',
        AuthorId: '',
        AlbumId: '',
        Genre: '',
        SongFile: null
      });

    useEffect(() => {
      const api = async () => {
        requestToServer("GET", `/Album?limit=${10000000}`, null, (d) => {
          setAlbums(d.value)
        }, (e) => {
            console.log(d)
        })
        requestToServer("GET", `/Author?limit=${10000000}`, null, (d) => {
            setAuthors(d.value)
          }, (e) => {
              console.log(d)
          })
      }
      api()
    }, [])

    const getSongs = (event) => {
        event.preventDefault();
        const data = {
            page: 10,
            limit: 10,
            albumId: formData.AlbumId,
            authorId: formData.AuthorId,
            pattern: formData.Name
        }
        let url = `/Song?limit=${10000000}&page=${page}`
        if (data.albumId) {
            url += `&albumId=${data.albumId}`
        }
        if (data.authorId) {
            url += `&authorId=${data.authorId}`
        }
        if (data.pattern) {
            url += `&pattern=${data.pattern}`
        }
        requestToServer("GET", url, null, (d) => {
            console.log(d)
            setSongs(d.value)
            
          }, (e) => {
            console.log(e)
          })
    };

    const handleInputChange = (e) => { 
        const { name, value } = e.target;
         
        setFormData(prevFormData => ({
          ...prevFormData,
          [name]: value
        }));
      };
    

    return (
        <form onSubmit={getSongs}>
            <div className="row g-3">
            <div className="col-md-6">
                <label htmlFor="buscar" className="form-label">Buscar Canción</label>
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
            
            <div className="col-md-3">
                <label htmlFor="album" className="form-label">Álbum</label>
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
            
            <div className="col-md-3">
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
            
            <div className="col-md-4">
                <label htmlFor="genero" className="form-label">Género</label> 
                <select 
                    name="Genre"
                    id="Genre"
                    value={formData.Genre}
                    onChange={handleInputChange}
                    >
                    {genres.map(ele => (
                        <option key={ele.id} value={ele.id}>{ele.name}</option>
                    ))}
                </select>
            </div>
            
            
            <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">Buscar</button>
            </div>
            </div>
        </form>
    )
}

export default Filters

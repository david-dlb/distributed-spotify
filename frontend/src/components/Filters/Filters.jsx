import React, { useEffect, useState } from 'react'
import { requestToServer } from '../../utils/server';
import { genres, getGenreNameById } from '../../utils/global';
import Select from '../Select/Select';


const Filters = ({ setSongs, page, reload }) => {
    const [albums, setAlbums] = useState([])
    const [authors, setAuthors] = useState([])
    const [albumPage, setAlbumPage] = useState(1)
    const [authorPage, setAuthorPage] = useState(1)
    const [formData, setFormData] = useState({
        Name: '',
        AuthorId: '',
        AlbumId: '',
        Genre: '',
        SongFile: null
    });

    const getAlbums = () => {
        requestToServer("GET", `/Album?limit=${14}&page=${albumPage}`, null, (d) => {
            setAlbums(prevAlbums => {
                const newAlbums = d.value.filter(album => !prevAlbums.find(a => a.id === album.id));
                return [...prevAlbums, ...newAlbums];
            });
        }, (e) => {
    console.error(e);
        })
    }
    const getAuthors = () => {
        requestToServer("GET", `/Author?limit=${10}&page=${page}`, null, (d) => {
            setAuthors([...albums, ...d.value])
        }, (e) => {
            console.error(e)
        })
    }

    const newAlbums = () => {
        console.log(albumPage)
        setAlbumPage(p => p + 1)
    }

    useEffect(() => {
        getAlbums()
    }, [albumPage])

    useEffect(() => {
      const api = async () => {
        getAlbums()
        getAuthors()
      }
      api()
    }, [])
    

    const getSongs = (event = null) => {
        if (event != null)event.preventDefault();
        const data = {
            page: page - 1,
            limit: 10,
            albumId: formData.AlbumId,
            authorId: formData.AuthorId,
            pattern: formData.Name
        }
        let url = `/Song?limit=${10}&page=${page}`
        if (data.albumId) {
            url += `&albumId=${data.albumId}`
        }
        if (data.authorId) {
            url += `&authorId=${data.authorId}`
        } 
        if (data.pattern) {
            url += `&pattern=${data.pattern}`
        }
        requestToServer("GET", url, null, async (d) => {
            let songs = []
            for (let index = 0; index < d.value.length; index++) {
                const ele = d.value[index];
                let albumDetails = null
                let authorDetails = null
                if (ele.albumId) {
                    await requestToServer("GET", `/Album?limit=1&id=${ele.albumId}`, null, (d) => {
                        albumDetails = d.value[0];
                    }, (e) => {
                        console.error(e);
                        return null;
                    });
                }
                if (ele.authorId) {
                    authorDetails = await requestToServer("GET", `/Author?limit=1&id=${ele.authorId}`, null, (d) => {
                        authorDetails = d.value[0];
                    }, (e) => {
                        console.error(e);
                        return null;
                    });   
                }
                // console.log(albumDetails, authorDetails, ele)
                songs.push({
                    ...ele,
                    "author": authorDetails,
                    "album": albumDetails,
                    "genre": getGenreNameById(ele.genre)
                })
            }
            setSongs(songs)
          }, (e) => {
            (e)
          })
    };

    const handleInputChange = (e) => { 
        const { name, value } = e.target;
         
        setFormData(prevFormData => ({
          ...prevFormData,
          [name]: value
        }));
    };
    
    useEffect(() => {
        getSongs()
    }, [page, reload])

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
                <Select
  name="AlbumId"
  id="album"
  value={formData.AlbumId}
  onChange={handleInputChange}
  options={albums.map(album => ({ value: album.id, label: album.name }))}
  page={newAlbums}
/>
            </div>
            
            <div className="col-md-3">
                <label htmlFor="autor" className="form-label">Autor</label>
                <select 
                    name="AuthorId" 
                    id="autor"
                    value={formData.AuthorId}
                    onChange={handleInputChange}
                    >
                    <option value={null}></option>
                    {authors.map(ele => (
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

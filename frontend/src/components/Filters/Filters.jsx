import React, { useEffect, useState } from 'react'
import { requestToServer } from '../../utils/server';
import { genres, getGenreNameById } from '../../utils/global';
import Select from '../Select/Select';
import { BackendService } from '../../utils/backend';


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

    const backendService = new BackendService()

    const getAlbums = () => {
        backendService.getAlbums(`?limit=${14}&page=${albumPage}`, (d) => {
            setAlbums(prevAlbums => {
                const newAlbums = d.value.filter(album => !prevAlbums.find(a => a.id === album.id));
                return [...prevAlbums, ...newAlbums];
            });
        }, (e) => {
    console.error(e);
        })
    }
    const getAuthors = () => {
        backendService.getAuthors(`?limit=${14}&page=${authorPage}`, (d) => {
            setAuthors([...authors, ...d.value])
        }, (e) => {
            console.error(e)
        })
    }

    const newAlbums = () => {
        setAlbumPage(p => p + 1)
    }
    const newAuthors = () => {
        setAuthorPage(p => p + 1)
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
        let url = `?limit=${10}&page=${page}`
        if (data.albumId) {
            url += `&albumId=${data.albumId}`
        }
        if (data.authorId) {
            url += `&authorId=${data.authorId}`
        } 
        if (data.pattern) {
            url += `&pattern=${data.pattern}`
        }
        backendService.getSongs(url, async (d) => {
            let songs = []
            for (let index = 0; index < d.value.length; index++) {
                const ele = d.value[index];
                let albumDetails = null
                let authorDetails = null
                let y = [null, null]
                if (ele.albumId) {
                    await backendService.getAlbums(`?limit=1&id=${ele.albumId}`, (d) => {
                        y[0] = d.value[0];
                    }, (e) => {
                        console.error(e);
                        return null;
                    });
                }
                if (ele.authorId) {
                    authorDetails = await backendService.getAuthors(`?limit=1&id=${ele.authorId}`, (d) => {
                        y[1] = d.value[0];
                    }, (e) => {
                        console.error(e);
                        return null;
                    });  
                }
                songs.push({
                    ...ele,
                    "author": y[1],
                    "album": y[0],
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
                <Select
                    name="AuthorId"
                    id="autor"
                    value={formData.AuthorId}
                    onChange={handleInputChange}
                    options={authors.map(author => ({ value: author.id, label: author.name }))}
                    page={newAuthors}
                />
            </div>
             
            
            
            <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">Buscar</button>
            </div>
            </div>
        </form>
    )
}

export default Filters

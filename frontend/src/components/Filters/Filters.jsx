import React, { useEffect, useState } from 'react'
import { requestToServer } from '../../utils/server';


const Filters = ({ setSongs }) => {
    const [albums, setAlbums] = useState([])
    const [authors, setAuthors] = useState([])

    useEffect(() => {
      const api = async () => {
        requestToServer("GET", `http://localhost:5140/api/Album?limit=${10000000}`, null, (d) => {
          setAlbums(d.value)
        }, (e) => {
            console.log(d)
        })
        requestToServer("GET", `http://localhost:5140/api/Author?limit=${10000000}`, null, (d) => {
            setAuthors(d.value)
          }, (e) => {
              console.log(d)
          })
      }
      api()
    }, [])

    const getSongs = () => {
        
    }

    console.log(12)
    return (
        <form>
            <div className="row g-3">
            <div className="col-md-6">
                <label htmlFor="buscar" className="form-label">Buscar Canción</label>
                <input type="text" className="form-control" id="buscar" placeholder="Ingresa el nombre de la canción"/>
            </div>
            
            <div className="col-md-3">
                <label htmlFor="album" className="form-label">Álbum</label>
                <select className="form-select" id="album">
                    {albums.map(ele => (
                        <option value={ele.id}>{ele.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="col-md-3">
                <label htmlFor="autor" className="form-label">Autor</label>
                <select className="form-select" id="author">
                    {authors.map(ele => (
                        <option value={ele.id}>{ele.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="col-md-4">
                <label htmlFor="genero" className="form-label">Género</label> 
            </div>
            
            
            <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">Buscar</button>
            </div>
            </div>
        </form>
    )
}

export default Filters

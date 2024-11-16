import React, { useEffect, useState } from 'react'
import { requestToServer, requestToServerForm } from '../utils/server';
import { genres } from '../utils/global';
import Navbar from '../components/Navbar/Navbar';


const Author = () => {
  const [authorName, setAuthorName] = useState('');
  const [authors, setAuthors] = useState([])  
  const [page, setPage] = useState(1)
  

  const addAuthor = (e) => {
    e.preventDefault()
    const data = {
      "name": authorName
    } 
    requestToServer("POST", `/Author`, data, (d) => {
      setAuthorName("")
      getAuthors()
      setPage(1)
    }, (err) => {
      console.log(err)
    })
  }

  const getAuthors = async () => {
    requestToServer("GET", `/Author?limit=${10}&page=${page - 1}`, null, (d) => {
      setAuthors(d.value) 
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
    requestToServer("DELETE", `/Author?AuthorId=${id}`, null, (d) => {
      getAuthors()
    }, (e) => {
        console.log(e)
    })
  } 

  useEffect(() => {
    getAuthors()
  }, [page])
  useEffect(() => {
    getAuthors()
  }, [])

  useEffect(() => {
    if (authors.length > 0) {
      // setPage(1)
    }
    if (authors.length == 0 && page > 0) {
      setPage(page - 1)
    }
  }, [authors])

  return (
    <div className="">
      <Navbar/>
      <div className="container my-5">
        <h2 className="text-center">Agregar Autor</h2>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgregarauthor">Agregar Álbum</button>
        </div>
      </div>

      <div className="modal fade" id="modalAgregarauthor" tabIndex="-1" aria-labelledby="modalAgregarauthorLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalAgregarauthorLabel">Agregar Álbum</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="author" onSubmit={addAuthor}>
                <div className="mb-3">
                  <label htmlFor="nombreauthor" className="form-label">Nombre del Álbum</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="name" 
                    id="nombreauthor" 
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

      <div>
        <table className="table table-striped container">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {authors.map((ele, index) => (
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

export default Author

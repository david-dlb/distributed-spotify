import React, { useState } from 'react'
import Navbar from '../components/Navbar/Navbar'


const Song = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="">
      <Navbar/>

      <div className="container my-5">
    <h2 class="text-center mb-4">Buscar Canciones</h2>Name
    
    <form>
      <div className="row g-3">
        <div className="col-md-6">
          <label for="buscar" className="form-label">Buscar Canción</label>
          <input type="text" class="form-control" id="buscar" placeholder="Ingresa el nombre de la canción"/>Name
        </div>
        
        <div className="col-md-3">
          <label for="album" className="form-label">Álbum</label>
          <select className="form-select" id="album">
            <option selected>Selecciona un álbum...</option>
            <option value="1">Álbum 1</option>
            <option value="2">Álbum 2</option>
            <option value="3">Álbum 3</option>
          </select>
        </div>
        
        <div className="col-md-3">
          <label for="autor" className="form-label">Autor</label>
          <select className="form-select" id="autor">
            <option selected>Selecciona un autor...</option>
            <option value="1">Autor 1</option>
            <option value="2">Autor 2</option>
            <option value="3">Autor 3</option>
          </select>
        </div>
        
        <div className="col-md-4">
          <label for="genero" className="form-label">Género</label>
          <select className="form-select" id="genero">
            <option selected>Selecciona un género...</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="jazz">Jazz</option>
          </select>
        </div>
         
        
        <div className="col-md-4 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">Buscar</button>Name
        </div>
      </div>
    </form>
  
    <div className="mt-5">
      <h3 className="text-center mb-4">Resultados de Búsqueda</h3>
      <table className="table table-striped">
        <thead id="songs">
          <tr>
            <th scope="col">Nombre de la Canción</th>
            <th scope="col">Autor</th>
            <th scope="col">Género</th>
            <th scope="col">Álbum</th>
          </tr>
        </thead>
        <tbody  id="songs">
          <tr>
            <td>Canción 1</td>
            <td>Autor 1</td>
            <td>Rock</td>
            <td>Álbum 1</td>
          </tr> 
        </tbody>
      </table>
    </div>
  </div>

    </div>
  )
}

export default Song

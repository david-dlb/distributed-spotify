import React, { useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Filters from '../components/Filters/Filters'


const Song = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="">
      <Navbar/>

      <div className="container my-5">
    <h2 className="text-center mb-4">Buscar Canciones</h2>
    
    <Filters/>
  
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

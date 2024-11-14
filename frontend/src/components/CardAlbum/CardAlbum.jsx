import React, { useState } from 'react'


const CardAlbum = ({ albums }) => {

    return (
    <div className="m-4 my-5">
        <h2 className="text-center mb-4">Álbums Populares</h2>
        <div className="row row-cols-1 row-cols-md-3 g-4">
            {albums.map((ele => (
                <div className="col">
                    <div className="card h-100">
                    <img src="https://via.placeholder.com/150" className="card-img-top" alt="Portada del Álbum 1"/>
                    <div className="card-body">
                        <h5 className="card-title">{ele.name}</h5>
                    </div>
                    </div>
                </div>
            )))}
          
        </div>
      </div>
    )
}

export default CardAlbum
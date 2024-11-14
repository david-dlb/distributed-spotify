import React, { useState } from 'react'


const Navbar = () => {

    return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
        <a className="navbar-brand" href="#">Spotify</a>
    
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
    
        <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            </ul>
    
            <form className="d-flex me-3">
            <input className="form-control me-2" type="search" placeholder="Buscar canciones..." aria-label="Buscar"/>
            </form>
    
            <button className="btn btn-success" type="button">Agregar Canción</button>
        </div>
        </div>
    </nav>
    )
}

export default Navbar
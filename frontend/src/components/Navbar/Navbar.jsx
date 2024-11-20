import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const searchTerm = event.target.search.value;
        navigate(`/song?search=${encodeURIComponent(searchTerm)}`);
    };

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
    
            <form className="d-flex me-3" onSubmit={handleSubmit}>
                <input 
                    className="form-control me-2 d-none" 
                    type="search" 
                    placeholder="Buscar canciones..." 
                    aria-label="Buscar"
                    name="search"
                />
                <button type="submit" className="btn btn-success">Buscar</button>
            </form>
            <a href="/add-album">
                <button className="btn btn-success" type="button">Agregar Album</button>
            </a>
            <a href="/add-author">
                <button className="btn btn-success ms-2" type="button">Agregar Autor</button>
            </a>
        </div>
        </div>
    </nav>
    )
}

export default Navbar

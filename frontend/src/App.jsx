import logo from './logo.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Home from './pages/home';
import Song from './pages/song';
import Add from './pages/add';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Album from './pages/album';
import Author from './pages/author';

import React, { createContext, useContext, useState } from 'react';
 const ProveedorMiContexto = ({ children }) => {
     const [songChunks, setSongChunks] = useState({});
 
     return (
         <MiContexto.Provider value={{ songChunks, setSongChunks }}>
             {children}
         </MiContexto.Provider>
     );
 };
export const MiContexto = createContext();
  
function App() {

  return (
    <ProveedorMiContexto>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/song" element={<Song />} />
        <Route path="/add" element={<Add />} />
        <Route path="/add-album" element={<Album />} />
        <Route path="/add-author" element={<Author />} />
      </Routes>
    </Router>
    </ProveedorMiContexto>
    
  )
}

export default App

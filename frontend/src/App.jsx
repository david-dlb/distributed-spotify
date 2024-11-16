import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Home from './pages/home';
import Song from './pages/song';
import Add from './pages/add';
import Album from './pages/album';
import Author from './pages/author';

function App() {

  return ( <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/song" element={<Song />} />
      <Route path="/add" element={<Add />} />
      <Route path="/add-album" element={<Album />} />
      <Route path="/add-author" element={<Author />} />
    </Routes>
  </Router>
  )
}

export default App

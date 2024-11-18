import React, { useState } from 'react'
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

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
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

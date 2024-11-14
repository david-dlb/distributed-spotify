import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Home from './pages/home';
import Song from './pages/song';
import Add from './pages/add';

function App() {
  const [count, setCount] = useState(0)

  return ( <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/song" element={<Song />} />
      <Route path="/add" element={<Add />} />
    </Routes>
  </Router>
  )
}

export default App

import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/home';
import Song from './pages/song';
import Add from './pages/add';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Add></Add>
  )
}

export default App

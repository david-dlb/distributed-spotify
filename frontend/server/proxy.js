const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');


const read = async (file) => {
  const filePath = path.join(__dirname, 'url.txt');
  let d = ""
  try {
    const contenido = await fs.promises.readFile(filePath, 'utf8');
    d = contenido
  } catch (error) {
    console.error('Error al leer el archivo:', error);
  }
  return d
}

// Configurar el puerto del servidor
const PORT = 8000;
app.use('/', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
  // Manejo de diferentes métodos
app.all('*', async (req, res) => {
  try {
    const options = {
      method: req.method
    };
    if (req.body) {
      options.headers = req.headers
    }
    if (req.body) {
      options.body = req.body
    }
    
    const url = await read("./url.txt")
    const a = await fetch(url + req.url, options)
    const r = await a.json()
    res.json(r)
  } catch (error) {
    console.log(error)
  }
  res.json([{ id: 1, name: 'John Doe' }]);
});

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor node  escuchando en http://localhost:${PORT}`);
});
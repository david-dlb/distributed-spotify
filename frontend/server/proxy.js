const express = require('express');

const app = express();

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
      const a = await fetch("http://10.0.11.2:6002" + req.url, options)
      const r = await a.json()
      res.json(r)
      console.log(r)
    } catch (error) {
      console.log(error)
    }
    res.json([{ id: 1, name: 'John Doe' }]);
  });

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor node  escuchando en http://localhost:${PORT}`);
});
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
  async function handleRequest(req, res) {
    let successResponse;
    
    const maxRetries = 3; // Número máximo de intentos
    let retries = 0;
  
    while (retries < maxRetries) {
      try {
        const options = {
          method: req.method,
          headers: req.headers,
          body: req.body
        };
  
        const url = await read("./url.txt");
        const response = await fetch(url + req.url, options);
  
        if (!response.ok) {
          throw new Error(`Respuesta no OK: ${response.status}`);
        }
  
        successResponse = await response.json();
        break;
      } catch (error) {
        retries++;
        console.log(`Intento ${retries}: Error ocurrió, reintentando...`);
        
        if (retries === maxRetries) {
          throw error; // Lanza el error después del número máximo de intentos
        }
        
        // Espera un poco antes del próximo intento para evitar sobrecarga del servidor
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  
    if (successResponse) {
      res.json(successResponse);
    } else {
      throw new Error("No se logró obtener respuesta exitosa después de múltiples intentos");
    }
  }
  
  // Uso en tu función principal
  app.all('*', async (req, res) => {
    try {
      await handleRequest(req, res);
    } catch (error) {
      console.error('Error final:', error);
      res.status(500).json({ message: "Fallo en la peticion al server", details: error.message });
    }
  });

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor node  escuchando en http://localhost:${PORT}`);
});
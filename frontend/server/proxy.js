const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const fileUpload = require("express-fileupload")
const FormData = require('form-data');  

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

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/"
}))

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
    // console.log(req.files.songFile, req.body)
    
    const maxRetries = 1; // Número máximo de intentos
    let retries = 0; 
   
      try {
        const options = {
          method: req.method,
          headers: req.headers,
          body: req.body
        };
        console.log(req.url, req.url.startsWith("/api/Song"))
        if (req.url.startsWith("/api/Song") && (req.method == "POST" || req.method == "PUT")) {
          if (!req.files || !req.files['songFile']) {
            console.error('songFile not found in req.files');
            // Maneja este caso, por ejemplo, retornando una respuesta de error
            return res.status(400).json({ error: 'Song file not uploaded' });
          }
          const data = new FormData()
          const file = req.files["songFile"]
          data.append('songFile',  file.data, {
            filename: file.name,          
            contentType: file.mimetype      
          });
          data.append('AlbumId', req.body.AlbumId);
          data.append('AuthorId', req.body.AuthorId);
          data.append('Genre', req.body.Genre);
          data.append('Name', req.body.Name);


          options.body = data
          console.log(options)
        }
        const url = await read("./url.txt");if (req.url.startsWith("/api/Song") && (req.method == "POST" || req.method == "PUT")) {
           
          console.log(url + req.url, options)
        } 
        const response = await fetch(url + req.url, options);
        
        if (!response.ok) {
          throw new Error(`Respuesta no OK: ${response.status}`);
        }
        if (req.url.startsWith("/api/Song/download/indexed")) {
          successResponse = await response.arrayBuffer() 
        } else { 
          successResponse = await response.json(); 
        } 
      } catch (error) {
        console.log(`Intento ${error}: ${req.url}Error ocurrió, reintentando...`);
        
        if (retries === maxRetries) {
          throw error; // Lanza el error después del número máximo de intentos
        }
        
        // Espera un poco antes del próximo intento para evitar sobrecarga del servidor
        await new Promise(resolve => setTimeout(resolve, 2000));
      } 
  
    if (successResponse) {
      if (req.url.startsWith("/api/Song/download/indexed")) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(Buffer.from(successResponse));
      } else { 
        res.json(successResponse);
      }
      
    } else {
      throw new Error("No se logró obtener respuesta exitosa después de múltiples intentos");
    }
  }
  
  // Uso en tu función principal
  app.all('*', async (req, res) => {
    try {
      await handleRequest(req, res);
      // console.log("salie")
    } catch (error) {
      console.error('Error final:', error);
      res.status(500).json({ message: "Fallo en la peticion al server", details: error.message });
    }
  });

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor node  escuchando en http://localhost:${PORT}`);
});
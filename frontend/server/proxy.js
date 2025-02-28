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

// app.use(fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/temp/"
// }))

const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Archivos se guardan en carpeta "uploads"

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
    // console.log(req.files, req.body)
    
    const maxRetries = 1; // Número máximo de intentos
    let retries = 0; 
   
      try {
        const options = {
          method: req.method,
          headers: req.headers,
          body: req.body
        };
        if (req.url.startsWith("/api/Song") && (req.method == "POST" || req.method == "PUT")) {
          
          // const data = new FormData()
          // const file = req.files["songFile"]
          // const emptyBlob = new Blob([], { type: 'application/octet-stream' });

          // data.append('songFile', emptyBlob, 'empty_file.txt');
          // data.append('AlbumId', req.body.AlbumId);
          // data.append('AuthorId', req.body.AuthorId);
          // data.append('Genre', req.body.Genre);
          // data.append('Name', req.body.Name);


          // options.body = data
          // console.log(options)
        }
        let response = null
        const url = await read("./url.txt");
        if (req.url.startsWith("/api/Song") && (req.method == "POST" || req.method == "PUT")) {
          const filePath = req.file.path;
        
          // Crear stream desde el archivo guardado
          const fileStream = fs.createReadStream(filePath);
          
          // Preparar formulario para enviar
          const form = new FormData();
          form.append("songFile", fileStream);
          form.append('AlbumId', req.body.AlbumId);
          form.append('AuthorId', req.body.AuthorId);
          form.append('Genre', req.body.Genre);
          form.append('Name', req.body.Name);
          options.body = form
          try {
          response = await fetch(url + req.url, {
            method: req.method,
            headers: form.headers,
            body: form
          });
          console.log(response)
            
          } catch (error) {
            console.log("eeror bigg", error)
          }
            // console.log(url + req.url, options, response)
        }else{
          response = await fetch(url + req.url, options);
        }
        
        
        if (!response.ok) {
          throw new Error(`Respuesta no OK: ${response.status} ${response.statusText}`);
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
  app.all('*', upload.single("songFile"), async (req, res) => {
    try {
      await handleRequest(req, res);
      // console.log("salie")
    } catch (error) {
      // console.error('Error final:', error);
      res.status(500).json({ message: "Fallo en la peticion al server", details: error.message });
    }
  });

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor node  escuchando en http://localhost:${PORT}`);
});
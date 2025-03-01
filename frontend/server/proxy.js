const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const fileUpload = require("express-fileupload")
const FormData = require('form-data');  
const { Readable } = require("stream");
const { Buffer } = require('buffer');
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
function copiarArrayBuffer(bufferOriginal) {
  // Verificar que el input es un ArrayBuffer
  if (!(bufferOriginal instanceof ArrayBuffer)) {
    throw new Error("El argumento no es un ArrayBuffer");
  }

  // Crear un nuevo ArrayBuffer con la misma longitud
  const bufferCopia = new ArrayBuffer(bufferOriginal.byteLength);

  // Copiar los datos del original a la copia
  const vistaOriginal = new Uint8Array(bufferOriginal);
  const vistaCopia = new Uint8Array(bufferCopia);
  vistaCopia.set(vistaOriginal);

  return bufferCopia;
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
    while(retries < maxRetries) {
      retries ++
      try {
        const options = {
          method: req.method,
          headers: req.headers,
          body: req.body
        }; 
        let response = null
        const url = await read("./url.txt");

        // hay dos tipos de peticion una que mandas un json y otra que mandas un FormData para cuando crear canciones
        if (req.url.startsWith("/api/Song") && (req.method == "POST" || req.method == "PUT")) {
          const filePath = req.file.path;
        
          if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
          }

 
      
          // Leer el archivo
          const fileBuffer = fs.readFileSync(filePath);
          const form = new FormData()
          form.append('songFile', fileBuffer);
          form.append('AlbumId', req.body.AlbumId);
          form.append('AuthorId', req.body.AuthorId);
          form.append('Genre', req.body.Genre);
          form.append('Name', req.body.Name);
          try {
            console.log(url + req.url)
            response = await fetch(url + req.url, {
              method: req.method,
              headers: form.getHeaders(),
              // headers: {
              //   // 'accept': 'text/plain',
              // },
              body: form,
            });
            console.log("song", response)
            
          } catch (error) {
            console.log("eeror bigg", error)
          }
            // console.log(url + req.url, options, response)
        }else{
          response = await fetch(url + req.url, options);
        }
        
        
        if (!response.ok) {
          console.log("no ok", response)
          throw new Error(`Respuesta no OK: ${response.status} ${response.statusText}`);
        }

        // se esperan dos tipos de repuesta un json y un arrayBuffer
        if (req.url.startsWith("/api/Song/download/indexed")) {
          
          const bufferOriginal = await response.arrayBuffer();
          successResponse = copiarArrayBuffer(bufferOriginal);

          console.log(bufferOriginal, successResponse)
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
    }
    if (successResponse) {

      // devuelve la respuesta dependiendo de que tipo sea
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
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configura CORS en el servidor de Express
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*", // Cambia este origen al de tu frontend
        methods: ["GET", "POST"]
    }
});

const chunks = [
    "1.ogg",
    "2.ogg",
    "3.ogg",
    "4.ogg",
    "5.ogg",
    "6.ogg",
    "7.ogg",
    "8.ogg",
];

app.get('/getChunk/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < 8) {
        const filePath = path.join(__dirname, 'audio', chunks[index]);
        fs.stat(filePath, (err, stats) => {
            if (err) {
                return res.status(404).send('Chunk not found');
            }
            res.setHeader('Content-Type', 'audio/ogg');
            res.sendFile(filePath);
        });
    } else {
        res.status(404).send('Chunk not found');
    }
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('requestSong', () => {
        chunks.forEach((chunk, index) => {
            const filePath = path.join(__dirname, 'audio', chunk);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Error al leer el archivo:', err);
                    return;
                }
                // Enviar cada chunk al cliente
                socket.emit('chunk', { index, data });
            });
        });
        socket.emit('endOfSong');
    });
});


// Endpoint para servir el archivo .mpd
app.get('/audio/manifest', (req, res) => {
    const manifestPath = path.join(__dirname, 'public', 'audio', 'tu_audio.mpd');
    res.setHeader('Content-Type', 'application/dash+xml');
    fs.createReadStream(manifestPath).pipe(res);
});

// Endpoint para servir el archivo de inicialización
app.get('/audio/init-stream0.m4s', (req, res) => {
    const initPath = path.join(__dirname, 'public', 'audio', 'init-stream0.m4s');
    res.setHeader('Content-Type', 'video/mp4');
    fs.createReadStream(initPath).pipe(res);
});

let i = -6
// Endpoint para servir los segmentos de audio
app.get('/audio/chunk-stream0-:segmentId.m4s', (req, res) => {
    const segmentId = req.params.segmentId;
    const segmentPath = path.join(__dirname, 'public', 'audio', `chunk-stream0-${segmentId}.m4s`);
    
    if (fs.existsSync(segmentPath)) {
        res.setHeader('Content-Type', 'video/mp4');
        fs.createReadStream(segmentPath).pipe(res);
    } else {
        res.status(404).send('Segmento no encontrado');
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

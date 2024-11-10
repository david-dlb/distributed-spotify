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

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

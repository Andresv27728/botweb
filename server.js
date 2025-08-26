import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { readSettings, writeSettings } from './lib/functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const appEvents = new EventEmitter();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await readSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer la configuración.' });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        const newSettings = req.body;
        await writeSettings(newSettings);
        // Notificar al proceso del bot que la configuración ha cambiado
        appEvents.emit('settings-updated', newSettings);
        res.json({ message: 'Configuración guardada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la configuración.' });
    }
});

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado al dashboard');
    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado del dashboard');
    });
});

export { server, io };

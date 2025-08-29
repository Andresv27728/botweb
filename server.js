import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { readSettings, writeSettings, performUpdate } from './lib/functions.js';

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

app.post('/api/update', (req, res) => {
    res.json({ message: 'Iniciando actualización... El bot se reiniciará en breve.' });

    // Iniciar la actualización de forma asíncrona
    performUpdate().catch(error => {
        console.error('El proceso de actualización falló:', error);
        // En este punto, no se puede enviar una nueva respuesta al cliente
        // porque la cabecera ya fue enviada. Solo se loguea el error.
    });
});

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado al dashboard');
    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado del dashboard');
    });
});

// --- EMISOR DE ESTADÍSTICAS DEL SERVIDOR ---
let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

setInterval(() => {
    // Uptime
    const uptime = process.uptime();
    const d = Math.floor(uptime / (3600*24));
    const h = Math.floor(uptime % (3600*24) / 3600);
    const m = Math.floor(uptime % 3600 / 60);
    const s = Math.floor(uptime % 60);
    const uptimeFormatted = `${d}d ${h}h ${m}m ${s}s`;

    // Memory
    const memoryUsage = process.memoryUsage().rss;
    const memoryMb = (memoryUsage / 1024 / 1024).toFixed(2);
    const totalMemoryMb = (os.totalmem() / 1024 / 1024).toFixed(2);

    // CPU
    const newCpuUsage = process.cpuUsage(lastCpuUsage);
    const newCpuTime = Date.now();
    const elapsedCpuTime = (newCpuUsage.user + newCpuUsage.system) / 1000; // in ms
    const elapsedTime = (newCpuTime - lastCpuTime); // in ms
    const cpuPercentage = (100 * elapsedCpuTime / elapsedTime / os.cpus().length).toFixed(2);

    lastCpuUsage = process.cpuUsage();
    lastCpuTime = Date.now();

    io.emit('server-stats', {
        uptime: uptimeFormatted,
        memory: `${memoryMb} MB / ${totalMemoryMb} MB`,
        cpu: `${cpuPercentage}%`
    });
}, 5000);


export { server, io };

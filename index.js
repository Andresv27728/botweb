import { Boom } from '@hapi/boom';
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { server, io, appEvents } from './server.js';
import { readSettings } from './lib/functions.js';

const logger = pino({ level: 'silent' }).child({ level: 'silent' });
const commands = new Map();
export const playMessageCache = new Map(); // Cache for play command messages
let botSettings = {};

// --- CARGADOR DE COMANDOS ---
async function loadCommands() {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    const commandFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const commandModule = await import(path.join('file://', pluginsDir, file));
            const command = commandModule.default;
            if (command && command.name) {
                commands.set(command.name, command);
                console.log(`Comando cargado: ${command.name}`);
            }
        } catch (error) {
            console.error(`Error al cargar el comando ${file}:`, error);
        }
    }
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando la versión de Baileys: ${version.join('.')}, ¿es la última?: ${isLatest}`);

    const sock = makeWASocket({
        version,
        auth: state,
        logger,
        browser: ['JulesBot', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('QR generado, enviando al cliente web.');
            io.emit('qr', qr);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada debido a', lastDisconnect.error, ', reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Conexión abierta');
            io.emit('connected', { botName: botSettings.botName });
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const remoteJid = msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];

        // --- MANEJO DE REACCIONES PARA DESCARGAS ---
        if (messageType === 'protocolMessage' && msg.message.protocolMessage.type === 'MESSAGE_REACTION') {
            const reaction = msg.message.protocolMessage;
            const reactedMsgKey = reaction.key;

            if (playMessageCache.has(reactedMsgKey.id)) {
                const { url, quotedMsg } = playMessageCache.get(reactedMsgKey.id);
                const emoji = reaction.reaction.text;
                let action;

                if (emoji === '♬') {
                    action = 'download_audio';
                } else if (emoji === '📹') {
                    action = 'download_video';
                } else {
                    return; // Ignorar otras reacciones
                }

                await sock.sendMessage(remoteJid, { text: 'Descargando, por favor espera...' }, { quoted: quotedMsg });
                try {
                    const apiUrl = action === 'download_audio'
                        ? `https://myapiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`
                        : `https://myapiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`;

                    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
                    const mediaBuffer = Buffer.from(response.data, 'binary');

                    if (action === 'download_audio') {
                        await sock.sendMessage(remoteJid, { audio: mediaBuffer, mimetype: 'audio/mp4' }, { quoted: quotedMsg });
                    } else {
                        await sock.sendMessage(remoteJid, { video: mediaBuffer, mimetype: 'video/mp4' }, { quoted: quotedMsg });
                    }
                } catch (error) {
                    console.error("Error en la descarga por reacción:", error);
                    await sock.sendMessage(remoteJid, { text: 'Hubo un error al descargar el archivo.' }, { quoted: quotedMsg });
                } finally {
                    playMessageCache.delete(reactedMsgKey.id); // Limpiar el caché
                }
                return;
            }
        }


        // --- MANEJO DE COMANDOS DE TEXTO ---
        const messageContent = messageType === 'conversation' ? msg.message.conversation :
                               messageType === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';

        if (!messageContent) return;

        const commandName = messageContent.split(' ')[0].toLowerCase();
        const args = messageContent.split(' ').slice(1);
        const command = commands.get(commandName);

        if (command) {
            try {
                await command.execute({ sock, msg, args, commands, settings: botSettings, io });
            } catch (error) {
                console.error(`Error al ejecutar el comando ${commandName}:`, error);
                await sock.sendMessage(remoteJid, { text: 'Ocurrió un error al ejecutar el comando.' }, { quoted: msg });
            }
        }
    });

    return sock;
}

// --- FUNCIÓN KEEP ALIVE PARA RENDER ---
function keepAlive() {
    const url = process.env.RENDER_EXTERNAL_URL;
    if (url) {
        setInterval(() => {
            console.log('Ping para mantener el bot activo...');
            axios.get(url).catch(err => {
                console.error('Error durante el ping:', err.message);
            });
        }, 14 * 60 * 1000); // 14 minutos
        console.log('Servicio Keep-Alive para Render activado.');
    } else {
        console.log('Servicio Keep-Alive desactivado (no se detectó URL de Render).');
    }
}

// --- INICIO DEL BOT ---
async function start() {
    botSettings = await readSettings();
    await loadCommands();
    await connectToWhatsApp();

    // Escuchar actualizaciones de configuración desde el servidor
    appEvents.on('settings-updated', (newSettings) => {
        console.log('Configuración actualizada, recargando en memoria...');
        botSettings = newSettings;
    });

    // Iniciar envío periódico de información del bot al dashboard
    setInterval(() => {
        io.emit('bot-info', {
            botName: botSettings.botName,
            latency: 'N/A', // Se actualizará con el comando ping
        });
    }, 5000);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
        console.log(`Visita http://localhost:${PORT} para ver el QR y el dashboard.`);
        keepAlive(); // Activar el servicio Keep-Alive
    });
}

start();

import { botName } from '../settings.js';

export default {
    name: 'ping',
    category: 'info',
    description: 'Mide la latencia del bot.',

    async execute({ sock, msg }) {
        const startTime = Date.now();
        const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: 'Calculando ping...' }, { quoted: msg });
        const endTime = Date.now();
        const latency = endTime - startTime;

        await sock.sendMessage(msg.key.remoteJid, {
            text: `*Pong!* 🏓\n*Latencia:* ${latency} ms`,
            edit: sentMsg.key
        });

        // También enviamos la latencia al dashboard
        // (Esto requiere que `io` esté disponible globalmente o pasado a través del contexto)
        // Por ahora, lo dejamos así y lo mejoraremos si es necesario.
    }
};

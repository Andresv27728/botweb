export default {
    name: 'ping',
    category: 'info',
    description: 'Mide la latencia del bot y la actualiza en el dashboard.',

    async execute({ sock, msg, io, settings }) {
        const startTime = Date.now();
        const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: 'Calculando ping...' }, { quoted: msg });
        const endTime = Date.now();
        const latency = endTime - startTime;

        await sock.sendMessage(msg.key.remoteJid, {
            text: `*Pong!* 🏓\n*Latencia:* ${latency} ms`,
            edit: sentMsg.key
        });

        // Enviar la latencia actualizada al dashboard
        if (io) {
            io.emit('bot-info', {
                botName: settings.botName,
                latency: `${latency} ms`
            });
        }
    }
};

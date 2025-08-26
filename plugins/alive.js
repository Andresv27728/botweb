export default {
    name: 'alive',
    category: 'info',
    description: 'Comprueba si el bot está en línea.',

    async execute({ sock, msg }) {
        await sock.sendMessage(msg.key.remoteJid, { text: '¡Estoy vivo! 🤖' }, { quoted: msg });
    }
};

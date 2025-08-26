export default {
    name: 'owner',
    category: 'info',
    description: 'Muestra el nombre del creador del bot.',

    async execute({ sock, msg, settings }) {
        await sock.sendMessage(msg.key.remoteJid, { text: `El creador de este bot es *${settings.ownerName}*.` }, { quoted: msg });
    }
};

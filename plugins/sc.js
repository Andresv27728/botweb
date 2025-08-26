export default {
    name: 'sc',
    category: 'info',
    description: 'Muestra el enlace al código fuente del bot.',

    async execute({ sock, msg }) {
        const sourceCodeUrl = 'https://github.com/your-username/your-repo'; // Reemplazar con la URL real
        const message = `Puedes encontrar el código fuente de este bot en:\n${sourceCodeUrl}`;
        await sock.sendMessage(msg.key.remoteJid, { text: message }, { quoted: msg });
    }
};

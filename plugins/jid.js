export default {
    name: 'jid',
    category: 'tools',
    description: 'Muestra tu JID (identificador de WhatsApp).',

    async execute({ sock, msg }) {
        const senderJid = msg.key.participant || msg.key.remoteJid;

        const replyText = `Tu JID es:\n\`\`\`${senderJid}\`\`\`\n\nPuedes usar este valor para configurar el propietario del bot en el dashboard web.`;

        await sock.sendMessage(msg.key.remoteJid, { text: replyText }, { quoted: msg });
    }
};

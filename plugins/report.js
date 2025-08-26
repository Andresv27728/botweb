export default {
    name: 'report',
    category: 'info',
    description: 'Reporta un problema o bug al creador del bot.',

    async execute({ sock, msg, args, settings }) {
        const { ownerJid } = settings;
        if (!ownerJid) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'El JID del propietario no está configurado.' }, { quoted: msg });
        }

        const reportMessage = args.join(' ');
        if (!reportMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, describe el problema que quieres reportar.' }, { quoted: msg });
        }

        const senderName = msg.pushName || 'un usuario';
        const senderJid = msg.key.remoteJid;

        const fullReport = `*Nuevo Reporte de Bug/Problema*\n\n*De:* ${senderName} (${senderJid})\n*Reporte:* ${reportMessage}`;

        try {
            await sock.sendMessage(ownerJid, { text: fullReport });
            await sock.sendMessage(msg.key.remoteJid, { text: '¡Gracias! Tu reporte ha sido enviado al creador.' }, { quoted: msg });
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'No se pudo enviar tu reporte. Por favor, inténtalo de nuevo más tarde.' }, { quoted: msg });
        }
    }
};

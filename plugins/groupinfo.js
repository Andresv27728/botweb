export default {
    name: 'groupinfo',
    category: 'group',
    description: 'Muestra información sobre el grupo actual.',

    async execute({ sock, msg }) {
        const remoteJid = msg.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        if (!isGroup) {
            return await sock.sendMessage(remoteJid, { text: 'Este comando solo se puede usar en grupos.' }, { quoted: msg });
        }

        try {
            const metadata = await sock.groupMetadata(remoteJid);

            let groupInfoText = `*Información del Grupo*\n\n`;
            groupInfoText += `*Nombre:* ${metadata.subject}\n`;
            groupInfoText += `*ID:* ${metadata.id}\n`;
            groupInfoText += `*Participantes:* ${metadata.participants.length}\n`;
            groupInfoText += `*Descripción:*\n${metadata.desc || 'Sin descripción'}\n`;

            await sock.sendMessage(remoteJid, { text: groupInfoText }, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando groupinfo:', error);
            await sock.sendMessage(remoteJid, { text: 'Ocurrió un error al obtener la información del grupo.' }, { quoted: msg });
        }
    }
};

import { performUpdate } from '../lib/functions.js';

export default {
    name: 'update',
    category: 'owner', // Even if public, it's an owner-level action
    description: 'Actualiza el bot a la última versión desde GitHub.',

    async execute({ sock, msg, settings }) {
        // Owner check
        const senderJid = msg.sender;
        const ownerJids = [settings.ownerLidJid, settings.ownerPhoneJid].filter(Boolean);

        if (!ownerJids.includes(senderJid)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: 'Este comando solo puede ser utilizado por el propietario del bot.'
            }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: 'Buscando actualizaciones...'
        }, { quoted: msg });

        const updateResult = await performUpdate();

        await sock.sendMessage(msg.key.remoteJid, {
            text: updateResult
        }, { quoted: msg });
    }
};

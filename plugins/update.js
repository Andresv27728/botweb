import { performUpdate } from '../lib/functions.js';

export default {
    name: 'update',
    category: 'owner', // Even if public, it's an owner-level action
    description: 'Actualiza el bot a la última versión desde GitHub.',

    async execute({ sock, msg }) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: 'Buscando actualizaciones...'
        }, { quoted: msg });

        const updateResult = await performUpdate();

        await sock.sendMessage(msg.key.remoteJid, {
            text: updateResult
        }, { quoted: msg });
    }
};

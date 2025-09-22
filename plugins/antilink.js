import { readSettings, writeSettings } from '../lib/functions.js';

export default {
    name: 'antilink',
    category: 'group',
    description: 'Activa o desactiva la función de anti-enlaces en el grupo.',

    async execute({ sock, msg, args }) {
        const remoteJid = msg.key.remoteJid;
        const subCommand = args[0]?.toLowerCase();

        // Check if it's a group
        if (!remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(remoteJid, { text: 'Este comando solo se puede usar en grupos.' }, { quoted: msg });
        }

        // Check permissions (user and bot must be admins)
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderParticipant = groupMetadata.participants.find(p => p.id === msg.sender);
        const botParticipant = groupMetadata.participants.find(p => p.id === botId);

        if (senderParticipant?.role !== 'admin' && senderParticipant?.role !== 'superadmin') {
            return await sock.sendMessage(remoteJid, { text: 'Este comando es solo para administradores.' }, { quoted: msg });
        }
        if (botParticipant?.role !== 'admin' && botParticipant?.role !== 'superadmin') {
            return await sock.sendMessage(remoteJid, { text: 'Necesito ser administrador para usar esta función.' }, { quoted: msg });
        }

        if (subCommand !== 'on' && subCommand !== 'off') {
            return await sock.sendMessage(remoteJid, { text: "Por favor, especifica una opción: 'on' o 'off'." }, { quoted: msg });
        }

        const settings = await readSettings();
        if (!settings.antilinkGroups) {
            settings.antilinkGroups = []; // Initialize if it doesn't exist
        }

        const isEnabled = settings.antilinkGroups.includes(remoteJid);

        if (subCommand === 'on') {
            if (isEnabled) {
                return await sock.sendMessage(remoteJid, { text: 'La función anti-enlaces ya está activada en este grupo.' }, { quoted: msg });
            }
            settings.antilinkGroups.push(remoteJid);
            await writeSettings(settings);
            await sock.sendMessage(remoteJid, { text: '✅ La función anti-enlaces ha sido activada.' }, { quoted: msg });
        } else { // 'off'
            if (!isEnabled) {
                return await sock.sendMessage(remoteJid, { text: 'La función anti-enlaces ya está desactivada en este grupo.' }, { quoted: msg });
            }
            settings.antilinkGroups = settings.antilinkGroups.filter(id => id !== remoteJid);
            await writeSettings(settings);
            await sock.sendMessage(remoteJid, { text: '❌ La función anti-enlaces ha sido desactivada.' }, { quoted: msg });
        }
    }
};

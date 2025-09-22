import { parseTime } from '../lib/functions.js';

export default {
    name: ['promote', 'demote', 'kick', 'grupo', 'grupotime'],
    category: 'group',
    description: 'Modera a los miembros y la configuración del grupo.',

    async execute({ sock, msg, args, command }) {
        const remoteJid = msg.key.remoteJid;

        if (!remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(remoteJid, { text: 'Este comando solo se puede usar en grupos.' }, { quoted: msg });
        }

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderParticipant = groupMetadata.participants.find(p => p.id === msg.sender);
        const botParticipant = groupMetadata.participants.find(p => p.id === botId);

        if (senderParticipant?.role !== 'admin' && senderParticipant?.role !== 'superadmin') {
            return await sock.sendMessage(remoteJid, { text: 'Este comando es solo para administradores de grupo.' }, { quoted: msg });
        }
        if (botParticipant?.role !== 'admin' && botParticipant?.role !== 'superadmin') {
            return await sock.sendMessage(remoteJid, { text: 'Necesito ser administrador para realizar esta acción.' }, { quoted: msg });
        }

        if (command === 'grupo') {
            const subCommand = args[0]?.toLowerCase();
            let setting, message;
            if (subCommand === 'abrir') {
                setting = 'not_announcement';
                message = 'El grupo ha sido abierto. Todos pueden enviar mensajes.';
            } else if (subCommand === 'cerrar') {
                setting = 'announcement';
                message = 'El grupo ha sido cerrado. Solo los administradores pueden enviar mensajes.';
            } else {
                return await sock.sendMessage(remoteJid, { text: "Por favor, especifica una opción: 'abrir' o 'cerrar'." }, { quoted: msg });
            }
            await sock.groupUpdateSetting(remoteJid, setting);
            return await sock.sendMessage(remoteJid, { text: message }, { quoted: msg });
        }

        if (command === 'grupotime') {
            const subCommand = args[0]?.toLowerCase();
            const timeStr = args[1];
            if (!subCommand || (subCommand !== 'abrir' && subCommand !== 'cerrar')) {
                return await sock.sendMessage(remoteJid, { text: "Por favor, especifica una opción: 'abrir' o 'cerrar'." }, { quoted: msg });
            }
            if (!timeStr) {
                return await sock.sendMessage(remoteJid, { text: "Por favor, especifica una duración (ej. 10s, 5m, 1h)." }, { quoted: msg });
            }
            const timeMs = parseTime(timeStr);
            if (!timeMs) {
                return await sock.sendMessage(remoteJid, { text: "Formato de tiempo inválido. Usa 's' para segundos, 'm' para minutos, 'h' para horas." }, { quoted: msg });
            }

            const action = subCommand === 'cerrar' ? 'announcement' : 'not_announcement';
            const oppositeAction = subCommand === 'cerrar' ? 'not_announcement' : 'announcement';
            const actionText = subCommand === 'cerrar' ? 'cerrado' : 'abierto';
            const oppositeActionText = subCommand === 'cerrar' ? 'abierto' : 'cerrado';

            await sock.groupUpdateSetting(remoteJid, action);
            await sock.sendMessage(remoteJid, { text: `El grupo ha sido ${actionText} por ${timeStr}.` }, { quoted: msg });

            setTimeout(async () => {
                await sock.groupUpdateSetting(remoteJid, oppositeAction);
                await sock.sendMessage(remoteJid, { text: `El tiempo ha terminado. El grupo ha sido ${oppositeActionText}.` });
            }, timeMs);
            return;
        }

        let participantsToActOn = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            participantsToActOn.push(msg.message.extendedTextMessage.contextInfo.participant);
        }
        participantsToActOn = [...new Set(participantsToActOn)];

        if (participantsToActOn.length === 0) {
            return await sock.sendMessage(remoteJid, { text: `Por favor, etiqueta o responde al mensaje del usuario al que quieres aplicar el comando '${command}'.` }, { quoted: msg });
        }

        let action, successMessage;
        switch (command) {
            case 'promote':
                action = 'promote';
                successMessage = 'Usuario(s) promovido(s) a administrador.';
                break;
            case 'demote':
                action = 'demote';
                successMessage = 'Administrador(es) degradado(s) a miembro.';
                break;
            case 'kick':
                action = 'remove';
                successMessage = 'Usuario(s) expulsado(s) del grupo.';
                break;
        }

        await sock.groupParticipantsUpdate(remoteJid, participantsToActOn, action);
        return await sock.sendMessage(remoteJid, { text: successMessage }, { quoted: msg });
    }
};

import { exec } from 'child_process';

export default {
    name: 'update',
    category: 'owner',
    description: 'Actualiza el bot con los últimos cambios de GitHub.',

    async execute({ sock, msg, settings }) {
        // Owner check
        const senderJid = msg.key.participant || msg.key.remoteJid;
        if (senderJid !== settings.ownerJid) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Este comando solo puede ser usado por el propietario del bot.' }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { text: 'Forzando actualización desde el repositorio de GitHub...' }, { quoted: msg });

        exec('git reset --hard && git pull', (error, stdout, stderr) => {
            if (error) {
                const errorMessage = `Error al ejecutar la actualización forzada:\n\n${stderr}`;
                console.error(errorMessage);
                sock.sendMessage(msg.key.remoteJid, { text: errorMessage }, { quoted: msg });
                return;
            }

            if (stdout.includes('Already up to date.')) {
                return sock.sendMessage(msg.key.remoteJid, { text: 'El bot ya está en la versión más reciente.' }, { quoted: msg });
            }

            const successMessage = `✅ Actualización completada.\n\n*Detalles:*\n${stdout}\n\nUsa el comando \`reload <comando>\` para aplicar los cambios en los plugins modificados.`;
            sock.sendMessage(msg.key.remoteJid, { text: successMessage }, { quoted: msg });
        });
    }
};

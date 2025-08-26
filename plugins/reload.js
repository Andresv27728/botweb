import path from 'path';
import fs from 'fs';

export default {
    name: 'reload',
    category: 'owner',
    description: 'Recarga el código de un comando específico.',

    async execute({ sock, msg, args, commands, settings }) {
        // Owner check
        const senderJid = msg.key.participant || msg.key.remoteJid;
        if (senderJid !== settings.ownerJid) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Este comando solo puede ser usado por el propietario del bot.' }, { quoted: msg });
        }

        if (args.length < 1) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, especifica el comando que quieres recargar.' }, { quoted: msg });
        }

        const commandNameToReload = args[0].toLowerCase();

        // Verificar si el comando existe
        if (!commands.has(commandNameToReload)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: `El comando \`${commandNameToReload}\` no existe.` }, { quoted: msg });
        }

        try {
            const pluginsDir = path.join(process.cwd(), 'plugins');
            // Encontrar el archivo correspondiente al comando
            const commandFile = fs.readdirSync(pluginsDir).find(file => {
                const commandName = file.split('.')[0];
                return commandName === commandNameToReload;
            });

            if (!commandFile) {
                return await sock.sendMessage(msg.key.remoteJid, { text: `No se encontró el archivo para el comando \`${commandNameToReload}\`.` }, { quoted: msg });
            }

            const filePath = path.join('file://', pluginsDir, commandFile);

            // Usar un timestamp para evitar el caché de módulos ES
            const newCommandModule = await import(`${filePath}?t=${Date.now()}`);
            const newCommand = newCommandModule.default;

            if (newCommand && newCommand.name) {
                commands.set(newCommand.name, newCommand);
                await sock.sendMessage(msg.key.remoteJid, { text: `El comando \`${newCommand.name}\` ha sido recargado exitosamente.` }, { quoted: msg });
            } else {
                throw new Error('El archivo del comando no tiene una exportación válida.');
            }

        } catch (error) {
            console.error(`Error al recargar el comando ${commandNameToReload}:`, error);
            await sock.sendMessage(msg.key.remoteJid, { text: `Ocurrió un error al recargar el comando:\n${error.message}` }, { quoted: msg });
        }
    }
};

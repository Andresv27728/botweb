export default {
    name: 'help',
    category: 'main',
    description: 'Muestra el menú de comandos (alias de `menu`).',

    async execute({ sock, msg, commands }) {
        // Ejecutar el comando 'menu'
        const menuCommand = commands.get('menu');
        if (menuCommand) {
            await menuCommand.execute({ sock, msg, commands });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: 'El comando de menú no está disponible.' }, { quoted: msg });
        }
    }
};

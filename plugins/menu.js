import { botName, ownerName } from '../settings.js';

export default {
    name: 'menu',
    category: 'main',
    description: 'Muestra todos los comandos disponibles.',

    async execute({ sock, msg, commands }) {
        const categories = {};

        // Agrupar comandos por categoría
        commands.forEach(command => {
            if (!command.category) return;
            if (!categories[command.category]) {
                categories[command.category] = [];
            }
            categories[command.category].push(command);
        });

        let menuText = `¡Hola! 👋 Soy ${botName}\n`;
        menuText += `Aquí tienes la lista de mis comandos:\n\n`;

        for (const category in categories) {
            menuText += `*${category.charAt(0).toUpperCase() + category.slice(1)}*\n`;
            categories[category].forEach(command => {
                menuText += `  - \`${command.name}\`: ${command.description || ''}\n`;
            });
            menuText += '\n';
        }

        menuText += `Creado por ${ownerName}.\n`;

        await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
};

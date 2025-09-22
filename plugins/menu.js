export default {
    name: 'menu',
    category: 'main',
    description: 'Muestra todos los comandos disponibles.',

    async execute({ sock, msg, commands, settings }) {
        const { botName, ownerName } = settings;
        const categories = {};

        // Group commands by category, handling both string and array names
        commands.forEach(command => {
            if (!command.category || command.category === 'owner') return; // Hide owner commands

            const commandName = Array.isArray(command.name) ? command.name[0] : command.name;

            if (!categories[command.category]) {
                categories[command.category] = [];
            }
            // Avoid duplicates from aliases
            if (!categories[command.category].some(c => c.name.includes(commandName))) {
                 categories[command.category].push({
                    name: Array.isArray(command.name) ? command.name.join(', ') : command.name,
                    description: command.description || ''
                });
            }
        });

        // Build the menu with borders
        let menuText = `╔═══════ *${botName}* ═══════╗\n`;
        menuText += `║\n`;
        menuText += `║ ¡Hola! 👋 Aquí tienes mis comandos:\n`;
        menuText += `║\n`;

        for (const category in categories) {
            menuText += `╠═ *${category.charAt(0).toUpperCase() + category.slice(1)}*\n`;
            categories[category].forEach(command => {
                menuText += `║  - \`${command.name}\`: ${command.description}\n`;
            });
            menuText += `║\n`;
        }

        menuText += `╚══════════════════════╝\n`;
        menuText += `Creado por ${ownerName}.\n`;

        await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
};

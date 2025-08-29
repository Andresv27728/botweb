export default {
    name: 'ppt',
    category: 'games',
    description: 'Juega Piedra, Papel o Tijera contra el bot.',
    aliases: ['rockpaperscissors'],

    async execute({ sock, msg, args }) {
        const userChoice = args[0]?.toLowerCase();
        const validChoices = ['piedra', 'papel', 'tijera'];

        if (!userChoice || !validChoices.includes(userChoice)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: `Por favor, elige una opción válida: piedra, papel o tijera.\nEjemplo: \`/ppt piedra\``
            }, { quoted: msg });
        }

        const botChoice = validChoices[Math.floor(Math.random() * validChoices.length)];

        let resultText;
        if (userChoice === botChoice) {
            resultText = '¡Es un empate! empate... 😐';
        } else if (
            (userChoice === 'piedra' && botChoice === 'tijera') ||
            (userChoice === 'papel' && botChoice === 'piedra') ||
            (userChoice === 'tijera' && botChoice === 'papel')
        ) {
            resultText = '¡Ganaste! ¡Felicidades! 🎉';
        } else {
            resultText = '¡Perdiste! ¡Mejor suerte la próxima! 😢';
        }

        const choiceToEmoji = {
            'piedra': '✊',
            'papel': '✋',
            'tijera': '✌️'
        };

        const reply = `Tú elegiste: ${choiceToEmoji[userChoice]} (${userChoice})\nYo elegí: ${choiceToEmoji[botChoice]} (${botChoice})\n\n*Resultado:* ${resultText}`;

        await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });
    }
};

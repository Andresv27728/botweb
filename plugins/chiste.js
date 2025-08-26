import axios from 'axios';

export default {
    name: 'chiste',
    category: 'fun',
    description: 'Cuenta un chiste al azar en español.',

    async execute({ sock, msg }) {
        try {
            const apiUrl = 'https://v2.jokeapi.dev/joke/Any?lang=es&safe-mode';
            const response = await axios.get(apiUrl);
            const jokeData = response.data;

            let jokeText = '';
            if (jokeData.type === 'single') {
                jokeText = jokeData.joke;
            } else if (jokeData.type === 'twopart') {
                jokeText = `${jokeData.setup}\n\n${jokeData.delivery}`;
            } else {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'No se pudo obtener un chiste en este momento.' }, { quoted: msg });
            }

            if (jokeData.error) {
                throw new Error('La API de chistes devolvió un error.');
            }

            await sock.sendMessage(msg.key.remoteJid, { text: jokeText }, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando chiste:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al buscar un chiste.' }, { quoted: msg });
        }
    }
};

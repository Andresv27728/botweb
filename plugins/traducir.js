import axios from 'axios';

export default {
    name: 'traducir',
    category: 'tools',
    description: 'Traduce texto de un idioma a otro usando la API de MyMemory.',

    async execute({ sock, msg, args }) {
        if (args.length < 3) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: 'Formato incorrecto. Usa: `traducir <texto> <idioma_origen> <idioma_destino>`\nEjemplo: `traducir Hello world en es`'
            }, { quoted: msg });
        }

        const to = args.pop();
        const from = args.pop();
        const text = args.join(' ');

        if (text.length > 500) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'El texto a traducir no puede superar los 500 caracteres.' }, { quoted: msg });
        }

        try {
            const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
            const response = await axios.get(apiUrl);

            const translatedText = response.data.responseData.translatedText;
            const match = response.data.responseData.match;

            if (translatedText) {
                let reply = `*Traducción:* ${translatedText}\n`;
                reply += `*Coincidencia:* ${(match * 100).toFixed(2)}%`;
                await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });
            } else {
                await sock.sendMessage(msg.key.remoteJid, { text: 'No se pudo obtener la traducción.' }, { quoted: msg });
            }

        } catch (error) {
            console.error('Error en el comando traducir:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al contactar el servicio de traducción.' }, { quoted: msg });
        }
    }
};

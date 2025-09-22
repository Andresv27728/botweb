import ytSearch from 'yt-search';
import axios from 'axios';
import { ytdl } from '../lib/functions.js';

export default {
    name: 'play',
    category: 'downloader',
    description: 'Busca y descarga una canción de YouTube.',

    async execute({ sock, msg, args }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona el nombre de una canción.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(msg.key.remoteJid, { text: `Buscando "${query}"...` }, { quoted: msg });

            const searchResults = await ytSearch(query);
            const video = searchResults.videos[0];

            if (!video) {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'No se encontraron resultados.' }, { quoted: msg });
            }

            const caption = `*Título:* ${video.title}\n*Duración:* ${video.timestamp}\n*Autor:* ${video.author.name}`;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: video.thumbnail },
                caption: caption + '\n\nDescargando audio, por favor espera...'
            }, { quoted: msg });

            const result = await ytdl(video.url, 'mp3');
            const audioBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });

            await sock.sendMessage(msg.key.remoteJid, {
                audio: Buffer.from(audioBuffer.data, 'binary'),
                mimetype: 'audio/mp4'
            }, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando play:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: `Ocurrió un error al descargar el audio: ${error.message}` }, { quoted: msg });
        }
    }
};

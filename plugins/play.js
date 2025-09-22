import ytSearch from 'yt-search';
import axios from 'axios';
import { ytdl } from '../lib/functions.js';

export default {
    name: 'play',
    category: 'downloader',
    description: 'Busca y descarga un video de YouTube.',

    async execute({ sock, msg, args }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona el nombre de un video.' }, { quoted: msg });
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
                caption: caption + '\n\nDescargando video, por favor espera...'
            }, { quoted: msg });

            // Use the ytdl helper to get the video link
            const result = await ytdl(video.url, 'mp4');

            // Download the video buffer from the link
            const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });

            await sock.sendMessage(msg.key.remoteJid, {
                video: Buffer.from(videoBuffer.data, 'binary'),
                mimetype: 'video/mp4',
                caption: caption
            }, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando play:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: `Ocurrió un error al descargar el video: ${error.message}` }, { quoted: msg });
        }
    }
};

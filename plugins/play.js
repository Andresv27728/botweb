import ytSearch from 'yt-search';
import axios from 'axios';

export default {
    name: 'play',
    category: 'downloader',
    description: 'Busca y descarga una canción o video de YouTube.',

    async execute({ sock, msg, args }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona el nombre de una canción o video.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(msg.key.remoteJid, { text: `Buscando "${query}"...` }, { quoted: msg });

            const searchResults = await ytSearch(query);
            const video = searchResults.videos[0];

            if (!video) {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'No se encontraron resultados.' }, { quoted: msg });
            }

            const videoUrl = video.url;
            const caption = `*Título:* ${video.title}\n*Duración:* ${video.timestamp}\n*Autor:* ${video.author.name}`;

            const buttons = [
                { buttonId: `download_audio:${videoUrl}`, buttonText: { displayText: 'Audio 🎵' }, type: 1 },
                { buttonId: `download_video:${videoUrl}`, buttonText: { displayText: 'Video 🎥' }, type: 1 }
            ];

            const buttonMessage = {
                image: { url: video.thumbnail },
                caption: caption,
                footer: 'Elige un formato para descargar',
                buttons: buttons,
                headerType: 4
            };

            await sock.sendMessage(msg.key.remoteJid, buttonMessage, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando play:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al buscar el video.' }, { quoted: msg });
        }
    }
};

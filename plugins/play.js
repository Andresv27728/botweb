import ytSearch from 'yt-search';
import { playMessageCache } from '../../index.js';

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
            const caption = `*Título:* ${video.title}\n*Duración:* ${video.timestamp}\n*Autor:* ${video.author.name}\n\nReacciona a este mensaje para descargar:\n♬ - Audio\n📹 - Video`;

            const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
                image: { url: video.thumbnail },
                caption: caption
            }, { quoted: msg });

            // Add reactions to the message
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '♬', key: sentMsg.key } });
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '📹', key: sentMsg.key } });

            // Store the message key and URL in the cache for the reaction handler
            playMessageCache.set(sentMsg.key.id, { url: videoUrl, quotedMsg: msg });

            // Optional: Remove from cache after a timeout to prevent memory leaks
            setTimeout(() => {
                if (playMessageCache.has(sentMsg.key.id)) {
                    playMessageCache.delete(sentMsg.key.id);
                    console.log(`Cache entry for ${sentMsg.key.id} expired and was removed.`);
                }
            }, 5 * 60 * 1000); // 5 minutes

        } catch (error) {
            console.error('Error en el comando play:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al buscar el video.' }, { quoted: msg });
        }
    }
};

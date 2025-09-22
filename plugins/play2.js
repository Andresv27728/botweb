import ytSearch from 'yt-search';
import ytdl from '@distube/ytdl-core';

export default {
    name: 'play2',
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

            const videoUrl = video.url;
            const caption = `*Título:* ${video.title}\n*Duración:* ${video.timestamp}\n*Autor:* ${video.author.name}`;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: video.thumbnail },
                caption: caption + '\n\nDescargando video, por favor espera...'
            }, { quoted: msg });

            const stream = ytdl(videoUrl, {
                quality: 'highest'
            });

            const chunks = [];
            stream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            stream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    mimetype: 'video/mp4',
                    caption: caption
                }, { quoted: msg });
            });

            stream.on('error', async (err) => {
                console.error('Error al descargar el video:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al descargar el video.' }, { quoted: msg });
            });

        } catch (error) {
            console.error('Error en el comando play2:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al buscar el video.' }, { quoted: msg });
        }
    }
};

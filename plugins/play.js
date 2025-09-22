import ytSearch from 'yt-search';
import ytdl from '@distube/ytdl-core';

export default {
    name: 'play',
    category: 'downloader',
    description: 'Busca y descarga una canción de YouTube.',

    async execute({ sock, msg, args, settings }) {
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

            const videoUrl = video.url;
            const caption = `*Título:* ${video.title}\n*Duración:* ${video.timestamp}\n*Autor:* ${video.author.name}`;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: video.thumbnail },
                caption: caption + '\n\nDescargando audio, por favor espera...'
            }, { quoted: msg });

            const ytdlOptions = {
                filter: 'audioonly',
                quality: 'lowestaudio',
                requestOptions: {
                    headers: {
                        cookie: settings.youtubeCookies || '',
                    },
                },
            };

            const stream = ytdl(videoUrl, ytdlOptions);

            const chunks = [];
            stream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            stream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4'
                }, { quoted: msg });
            });

            stream.on('error', async (err) => {
                console.error('Error al descargar el audio:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al descargar el audio.' }, { quoted: msg });
            });

        } catch (error) {
            console.error('Error en el comando play:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al buscar la canción.' }, { quoted: msg });
        }
    }
};

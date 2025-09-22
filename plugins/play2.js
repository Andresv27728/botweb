import ytSearch from 'yt-search';
import axios from 'axios';

export default {
    name: 'play2',
    category: 'downloader',
    description: 'Busca y descarga un video de YouTube usando la API de Apify.',

    async execute({ sock, msg, args, settings }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona el nombre de un video.' }, { quoted: msg });
        }

        if (!settings.apifyToken) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'El token de la API de Apify no está configurado. Por favor, añádelo al archivo settings.json.' }, { quoted: msg });
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

            const apiUrl = `https://api.apify.com/v2/acts/scrapearchitect~youtube-video-downloader/run-sync-get-dataset-items?token=${settings.apifyToken}`;
            const apiInput = {
                video_urls: [{ url: videoUrl }],
                desired_resolution: '720p', // A reasonable default quality
            };

            const apiResponse = await axios.post(apiUrl, apiInput);

            if (apiResponse.data && apiResponse.data.length > 0) {
                const result = apiResponse.data[0];
                const videoLink = result.merged_downloadable_link;

                if (videoLink) {
                    const videoBuffer = await axios.get(videoLink, { responseType: 'arraybuffer' });
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: Buffer.from(videoBuffer.data, 'binary'),
                        mimetype: 'video/mp4',
                        caption: caption
                    }, { quoted: msg });
                } else {
                    throw new Error('El API no devolvió un enlace de video.');
                }
            } else {
                throw new Error('La respuesta del API estaba vacía o en un formato incorrecto.');
            }

        } catch (error) {
            console.error('Error en el comando play2:', error);
            const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
            await sock.sendMessage(msg.key.remoteJid, { text: `Ocurrió un error al descargar el video: ${errorMessage}` }, { quoted: msg });
        }
    }
};

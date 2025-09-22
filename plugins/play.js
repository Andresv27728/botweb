import ytSearch from 'yt-search';
import axios from 'axios';

export default {
    name: 'play',
    category: 'downloader',
    description: 'Busca y descarga una canción de YouTube usando la API de Apify.',

    async execute({ sock, msg, args, settings }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona el nombre de una canción.' }, { quoted: msg });
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
                caption: caption + '\n\nDescargando audio, por favor espera...'
            }, { quoted: msg });

            const apiUrl = `https://api.apify.com/v2/acts/scrapearchitect~youtube-video-downloader/run-sync-get-dataset-items?token=${settings.apifyToken}`;
            const apiInput = {
                video_urls: [{ url: videoUrl }],
                desired_resolution: '360p', // Lower resolution is fine for audio-only context
            };

            const apiResponse = await axios.post(apiUrl, apiInput);

            if (apiResponse.data && apiResponse.data.length > 0) {
                const result = apiResponse.data[0];
                const audioLink = result.downloadable_audio_link;

                if (audioLink) {
                    const audioBuffer = await axios.get(audioLink, { responseType: 'arraybuffer' });
                    await sock.sendMessage(msg.key.remoteJid, {
                        audio: Buffer.from(audioBuffer.data, 'binary'),
                        mimetype: 'audio/mp4'
                    }, { quoted: msg });
                } else {
                    throw new Error('El API no devolvió un enlace de audio.');
                }
            } else {
                throw new Error('La respuesta del API estaba vacía o en un formato incorrecto.');
            }

        } catch (error) {
            console.error('Error en el comando play:', error);
            const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
            await sock.sendMessage(msg.key.remoteJid, { text: `Ocurrió un error al descargar el audio: ${errorMessage}` }, { quoted: msg });
        }
    }
};

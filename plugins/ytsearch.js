import ytSearch from 'yt-search';

export default {
    name: 'ytsearch',
    category: 'downloader',
    description: 'Busca videos en YouTube y muestra los resultados.',

    async execute({ sock, msg, args }) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona un término de búsqueda.' }, { quoted: msg });
        }

        try {
            const searchResults = await ytSearch(query);
            const videos = searchResults.videos.slice(0, 5); // Tomar los primeros 5 resultados

            if (videos.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'No se encontraron resultados.' }, { quoted: msg });
            }

            let responseText = `*Resultados de búsqueda para "${query}":*\n\n`;
            videos.forEach((video, index) => {
                responseText += `*${index + 1}. ${video.title}*\n`;
                responseText += `*Duración:* ${video.timestamp}\n`;
                responseText += `*Autor:* ${video.author.name}\n`;
                responseText += `*URL:* ${video.url}\n\n`;
            });

            await sock.sendMessage(msg.key.remoteJid, { text: responseText }, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando ytsearch:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al buscar en YouTube.' }, { quoted: msg });
        }
    }
};

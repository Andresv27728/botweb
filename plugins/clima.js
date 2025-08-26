import axios from 'axios';

export default {
    name: 'clima',
    category: 'tools',
    description: 'Muestra el clima actual de una ciudad.',

    async execute({ sock, msg, args }) {
        const city = args.join(' ');
        if (!city) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, proporciona el nombre de una ciudad.' }, { quoted: msg });
        }

        try {
            // 1. Geocodificación: Obtener coordenadas de la ciudad
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
            const geoResponse = await axios.get(geoUrl);

            if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: `No se pudo encontrar la ciudad "${city}".` }, { quoted: msg });
            }

            const location = geoResponse.data.results[0];
            const { latitude, longitude, name, country } = location;

            // 2. Pronóstico: Obtener el clima usando las coordenadas
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
            const weatherResponse = await axios.get(weatherUrl);

            const weather = weatherResponse.data.current_weather;
            const temperature = weather.temperature;
            const windspeed = weather.windspeed;
            const weathercode = weather.weathercode;

            // Función para obtener un emoji representativo del clima
            function getWeatherEmoji(code) {
                if (code === 0) return '☀️'; // Despejado
                if (code <= 3) return '⛅️'; // Parcialmente nublado
                if (code <= 48) return '☁️'; // Nublado / Niebla
                if (code <= 67) return '🌧️'; // Lluvia
                if (code <= 77) return '❄️'; // Nieve
                if (code <= 99) return '⛈️'; // Tormenta
                return '🌍';
            }

            const weatherText = `*Clima en ${name}, ${country}*\n\n` +
                              `${getWeatherEmoji(weathercode)} *Temperatura:* ${temperature}°C\n` +
                              `💨 *Viento:* ${windspeed} km/h`;

            await sock.sendMessage(msg.key.remoteJid, { text: weatherText }, { quoted: msg });

        } catch (error) {
            console.error('Error en el comando clima:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Ocurrió un error al obtener la información del clima.' }, { quoted: msg });
        }
    }
};

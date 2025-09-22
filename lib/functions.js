import fs from 'fs/promises';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const exec = promisify(execCallback);
const settingsPath = path.join(process.cwd(), 'settings.json');

/**
 * Lee y parsea el archivo settings.json
 * @returns {Promise<object>} El objeto de configuración.
 */
export async function readSettings() {
    try {
        const data = await fs.readFile(settingsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer settings.json:", error);
        // Devuelve valores por defecto si el archivo no existe o hay un error
        return {
            botName: "JulesBot",
            ownerName: "Jules",
            ownerNumber: "1234567890"
        };
    }
}

/**
 * Escribe el objeto de configuración en settings.json
 * @param {object} newSettings - El nuevo objeto de configuración para guardar.
 */
export async function writeSettings(newSettings) {
    try {
        await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al escribir en settings.json:", error);
    }
}

/**
 * Realiza una actualización del bot desde GitHub y lo reinicia.
 * Retorna un mensaje de estado sobre el resultado del proceso.
 * @returns {Promise<string>} Mensaje de estado.
 */
export async function performUpdate() {
    console.log('Iniciando actualización desde GitHub...');
    try {
        console.log('Ejecutando git pull...');
        const { stdout: gitStdout, stderr: gitStderr } = await exec('git pull');
        console.log('Git pull stdout:', gitStdout);
        if (gitStderr) console.error('Git pull stderr:', gitStderr);

        // Comprobar si el repositorio ya estaba actualizado
        if (gitStdout.includes('Already up to date') || gitStdout.includes('Ya está actualizado')) {
            console.log('No hay cambios. Actualización no necesaria.');
            return 'El bot ya está en la última versión. No se requiere reinicio.';
        }

        console.log('Cambios detectados. Ejecutando npm install...');
        const { stdout: npmStdout, stderr: npmStderr } = await exec('npm install');
        console.log('npm install stdout:', npmStdout);
        if (npmStderr) console.error('npm install stderr:', npmStderr);

        console.log('Actualización completada. Reiniciando el bot en 2 segundos...');
        setTimeout(() => {
            process.exit();
        }, 2000);

        return 'Actualización completada. El bot se está reiniciando...';

    } catch (error) {
        console.error('Falló el proceso de actualización:', error);
        return `Error durante la actualización: ${error.message}`;
    }
}

/**
 * Downloads a YouTube video as audio or video using an external API.
 * @param {string} url The YouTube video URL.
 * @param {('mp3'|'mp4')} type The desired format, 'mp3' for audio, 'mp4' for video.
 * @returns {Promise<{url: string, title: string}>} An object containing the download URL and video title.
 */
export async function ytdl(url, type = 'mp4') {
    const headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Chromium";v="132", "Not A(Brand";v="8"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'referer': 'https://id.ytmp3.mobi/',
        'referrer-policy': 'strict-origin-when-cross-origin'
    };

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
    if (!videoId) throw new Error('No se pudo encontrar el ID del video.');

    const initResponse = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`, { headers });
    const init = initResponse.data;

    const convertResponse = await axios.get(`${init.convertURL}&v=${videoId}&f=${type}&_=${Date.now()}`, { headers });
    const convert = convertResponse.data;

    let info;
    for (let i = 0; i < 3; i++) {
        const progressResponse = await axios.get(convert.progressURL, { headers });
        info = progressResponse.data;
        if (info.progress === 3) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!info || !convert.downloadURL) throw new Error('No se pudo obtener el enlace de descarga desde la API.');

    if (type === 'mp3' && info.duration > 360) { // 6 minutes
        throw new Error('El audio es demasiado largo (>6 minutos).');
    }

    return { url: convert.downloadURL, title: info.title || 'Archivo de YouTube' };
}

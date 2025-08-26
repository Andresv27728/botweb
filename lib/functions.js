import fs from 'fs/promises';
import path from 'path';

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

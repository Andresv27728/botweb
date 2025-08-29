import fs from 'fs/promises';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

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

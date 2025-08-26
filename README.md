# WhatsApp Bot con Baileys y Comandos Dinámicos

Este es un bot de WhatsApp multifuncional construido con `@whiskeysockets/baileys`. Cuenta con un sistema de comandos dinámico basado en plugins, un dashboard web para la vinculación mediante código QR y funcionalidades interactivas como botones.

## Características

- **Conexión con Baileys:** Utiliza la última versión de Baileys para una conexión estable y eficiente.
- **Sin Prefijos:** Los comandos se activan por su nombre, sin necesidad de un prefijo.
- **Comandos en Plugins:** Cada comando es un módulo independiente en la carpeta `plugins`, lo que facilita su mantenimiento y expansión.
- **Menú Automático:** El comando `menu` se genera automáticamente a partir de los plugins existentes y los agrupa por categoría.
- **Dashboard Web:** Muestra el código QR para vincular el bot y, una vez conectado, muestra información básica.
- **Comandos Interactivos:** Capacidad para enviar mensajes con botones, como se ve en el comando `play`.
- **Despliegue en Render:** Preparado para un despliegue sencillo en plataformas como Render.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- npm (generalmente viene con Node.js)

## Instalación

1. **Clona el repositorio (o descarga los archivos):**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

## Configuración

Abre el archivo `settings.js` y personaliza los siguientes valores:

```javascript
export const botName = "TuNombreDeBot";
export const ownerName = "TuNombre";
export const ownerNumber = "1234567890"; // Tu número de WhatsApp, solo los dígitos
```

- `botName`: El nombre que usará el bot en los mensajes.
- `ownerName`: Tu nombre, que aparecerá en algunos mensajes.
- `ownerNumber`: Tu número de teléfono sin el `+` ni espacios. Se usará para comandos como `report`.

## Cómo Ejecutar el Bot

1. **Inicia el bot:**
   ```bash
   npm start
   ```

2. **Vincula tu cuenta de WhatsApp:**
   - Una vez que el servidor se inicie, verás un mensaje en la consola: `Servidor escuchando en el puerto 3000`.
   - Abre tu navegador y ve a `http://localhost:3000`.
   - Verás un código QR. Escanéalo con la aplicación de WhatsApp en tu teléfono (en `Dispositivos Vinculados`).

3. **¡Listo!**
   - Una vez conectado, la página web mostrará el dashboard y el bot estará listo para recibir comandos en WhatsApp. La información de la sesión se guardará en la carpeta `auth_info_baileys`, por lo que no necesitarás escanear el QR cada vez que reinicies el bot.

## Despliegue en Render

1. Haz un fork de este repositorio en tu cuenta de GitHub.
2. Ve a tu dashboard de Render y crea un nuevo "Web Service".
3. Conecta tu repositorio de GitHub.
4. En la configuración del servicio:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. ¡Eso es todo! Render instalará las dependencias y ejecutará el bot. La URL pública que Render te proporcione será donde podrás ver el código QR para vincular.

---

## Cómo Crear un Nuevo Comando

Crear comandos es muy sencillo. Simplemente crea un nuevo archivo `.js` dentro de la carpeta `plugins`. El bot cargará automáticamente cualquier archivo que encuentre allí.

Aquí tienes una plantilla comentada para un nuevo comando:

```javascript
// plugins/miComando.js

// Puedes importar lo que necesites aquí
// import { someUtil } from '../utils.js';

// Cada comando debe exportar un objeto por defecto
export default {
    /**
     * @name: El nombre del comando. Así es como los usuarios lo llamarán.
     * Debe ser único y en minúsculas. (Obligatorio)
     */
    name: 'micomando',

    /**
     * @category: La categoría a la que pertenece el comando.
     * Se usa para agrupar comandos en el menú. (Recomendado)
     */
    category: 'general',

    /**
     * @description: Una breve descripción de lo que hace el comando.
     * Se mostrará en el menú. (Recomendado)
     */
    description: 'Este es un comando de ejemplo.',

    /**
     * @execute: La función principal que se ejecuta cuando se llama al comando.
     * Es una función asíncrona que recibe un objeto con el contexto. (Obligatorio)
     */
    async execute({ sock, msg, args, commands }) {
        // ---- CONTEXTO ----
        // sock: La instancia del socket de Baileys. Úsala para enviar mensajes, etc.
        // msg: El objeto completo del mensaje que activó el comando.
        // args: Un array de strings con los argumentos pasados al comando.
        //       Ej: si el mensaje fue "micomando arg1 arg2", args será ['arg1', 'arg2'].
        // commands: Un Map con todos los comandos cargados, por si necesitas llamar a otro comando.

        const remoteJid = msg.key.remoteJid; // El chat donde se envió el mensaje

        // Tu lógica aquí
        const respuesta = `¡Hola! Has ejecutado mi comando con los argumentos: ${args.join(', ')}`;

        // Envía una respuesta
        await sock.sendMessage(remoteJid, { text: respuesta }, { quoted: msg });
    }
};
```

### Ejemplo: Comando `saludo`

1. Crea el archivo `plugins/saludo.js`.
2. Pega el siguiente código:

```javascript
// plugins/saludo.js
export default {
    name: 'saludo',
    category: 'fun',
    description: 'Saluda al usuario.',
    async execute({ sock, msg }) {
        const senderName = msg.pushName || 'amigo';
        await sock.sendMessage(msg.key.remoteJid, { text: `¡Hola, ${senderName}! 👋` }, { quoted: msg });
    }
};
```

3. Reinicia el bot. ¡El nuevo comando `saludo` ya estará disponible y aparecerá en el menú!

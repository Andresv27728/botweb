import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'sticker',
    category: 'fun',
    description: 'Convierte una imagen o video en un sticker.',

    async execute({ sock, msg }) {
        const messageType = Object.keys(msg.message)[0];
        const isMedia = (messageType === 'imageMessage' || messageType === 'videoMessage');
        const isQuotedMedia = msg.message.extendedTextMessage?.contextInfo?.quotedMessage &&
                              (msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage ||
                               msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage);

        if (isMedia || isQuotedMedia) {
            let stream;
            if (isQuotedMedia) {
                stream = await downloadContentFromMessage(
                    msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage || msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage,
                    isQuotedMedia.imageMessage ? 'image' : 'video'
                );
            } else {
                stream = await downloadContentFromMessage(msg.message, isMedia.imageMessage ? 'image' : 'video');
            }

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const sticker = new Sticker(buffer, {
                pack: 'JulesBot Stickers',
                author: 'Jules',
                type: StickerTypes.FULL,
                quality: 50
            });

            await sock.sendMessage(msg.key.remoteJid, await sticker.toMessage(), { quoted: msg });

        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, envía una imagen o video, o responde a uno para convertirlo en sticker.' }, { quoted: msg });
        }
    }
};

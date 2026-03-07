const handler = async (message, { conn, usedPrefix = '.' }) => {

const menuText = `
╭━━━〔 🎨 IMAGE PANEL 〕━⬣
┃ 🖼️ Comandi immagini divertenti
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🧪 METRI DIVERTENTI 〕━⬣
┃ 🥰 ${usedPrefix}bellometro
┃ 🌈 ${usedPrefix}gaymetro
┃ 💖 ${usedPrefix}lesbiometro
┃ 🍆 ${usedPrefix}masturbometro
┃ 🍀 ${usedPrefix}fortunometro
┃ 🧠 ${usedPrefix}intelligiometro
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎭 IMMAGINI MEME 〕━⬣
┃ 💦 ${usedPrefix}sborra
┃ ❤️ ${usedPrefix}il
┃ 🕴 ${usedPrefix}wasted
┃ 💂 ${usedPrefix}comunista
┃ 👙 ${usedPrefix}bisex
┃ 🏳️‍🌈 ${usedPrefix}gay
┃ 🃏 ${usedPrefix}simpcard
┃ 🏳️‍⚧️ ${usedPrefix}trans
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 INFO 〕━⬣
┃ Categoria: Immagini
┃ Versione: 1.0
┃ Status: Online ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim();

await conn.sendMessage(message.chat, { text: menuText });

};

handler.help = ['menuimmagini'];
handler.tags = ['menu'];
handler.command = /^(immagini)$/i;

export default handler;
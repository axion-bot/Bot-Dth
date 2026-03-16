const handler = async (message, { conn, usedPrefix = '.' }) => {

const userCount = Object.keys(global.db?.data?.users || {}).length;

const testo = `
╭━━━〔 🎮 GAME CENTER 〕━━━⬣
┃ 👥 Utenti registrati: ${userCount}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🕹️ GIOCHI 〕━━━⬣
┃ ❌⭕ ${usedPrefix}tris
┃ 🏟️ ${usedPrefix}schedina <euro>
┃ 🪢 ${usedPrefix}impiccato
┃ 🤣 ${usedPrefix}meme
┃ 🍣 ${usedPrefix}cibo
┃ 🚩 ${usedPrefix}bandiera
┃ 🏆 ${usedPrefix}classificabandiera
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎲 FUN 〕━━━⬣
┃ 🔮 ${usedPrefix}random <reply/tag>
┃ 🔥 ${usedPrefix}flame <reply/tag>
┃ 🏷️ ${usedPrefix}s
┃ ✨ ${usedPrefix}wm
┃ 🎶 ${usedPrefix}cur
┃ 🩵 ${usedPrefix}onlyfans <nome>
┃ 💼 ${usedPrefix}curriculum
┃ 🏬 ${usedPrefix}shop
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💍 FAMIGLIA 〕━━━⬣
┃ 👰 ${usedPrefix}sposa
┃ 💔 ${usedPrefix}divorzia
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 INFO 〕━━━⬣
┃ Categoria: Giochi
┃ Versione: 1.0
┃ Status: Online ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim();

await conn.sendMessage(message.chat, { text: testo });

};

handler.help = ['menugiochi', 'giochi'];
handler.tags = ['menu'];
handler.command = /^(menugiochi|giochi)$/i;

export default handler;
const handler = async (message, { conn, usedPrefix = '.' }) => {

const testo = `
╭━━━〔 👑 OWNER PANEL 〕━⬣
┃ ⚡ Accesso riservato all'Owner
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 GESTIONE UTENTI 〕━⬣
┃ 🔇 ${usedPrefix}banuser
┃ 🔊 ${usedPrefix}unbanuser
┃ 🛡️ ${usedPrefix}addmod
┃ ❌ ${usedPrefix}delmod
┃ 🗑️ ${usedPrefix}resetmod
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🤖 GESTIONE BOT 〕━⬣
┃ 📥 ${usedPrefix}join <link>
┃ 💾 ${usedPrefix}reimpostagp
┃ 📢 ${usedPrefix}tuttigp
┃ 🆔 ${usedPrefix}getid <link>
┃ 👋 ${usedPrefix}out
┃ 🌐 ${usedPrefix}aggiorna
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 ✨ FUNZIONI SPECIALI 〕━⬣
┃ 🏹 ${usedPrefix}bigtag
┃ 📂 ${usedPrefix}gruppi
┃ 🚪 ${usedPrefix}esci <numero>
┃ 🌙 ${usedPrefix}bonoir
┃ ☀️ ${usedPrefix}wakeywakey
┃ 🗂️ ${usedPrefix}getpl
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 INFO 〕━⬣
┃ Versione: 1.0
┃ Status: Online ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim();

await conn.sendMessage(message.chat, {
    text: testo
});

};

handler.help = ['owner'];
handler.tags = ['menu'];
handler.command = /^(owner)$/i;

export default handler;
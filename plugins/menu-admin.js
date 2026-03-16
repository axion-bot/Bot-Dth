const handler = async (message, { conn, usedPrefix = '.' }) => {

    const testo = `
╭━━━〔 ⚙️ ADMIN PANEL 〕━━━⬣
┃ 👑 Comandi riservati agli Admin
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🛠️ GESTIONE 〕━━━⬣
┃ 🚨 ${usedPrefix}rouletteban
┃ 🛡️ ${usedPrefix}admins
┃ ✅ ${usedPrefix}richieste
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚠️ WARN 〕━━━⬣
┃ ⚠️ ${usedPrefix}warn
┃ ✅ ${usedPrefix}unwarn
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔇 CONTROLLO CHAT 〕━━━⬣
┃ 🤫 ${usedPrefix}muta
┃ 🔊 ${usedPrefix}smuta
┃ 🏹 ${usedPrefix}tag
┃ 🚨 ${usedPrefix}setname
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔒 IMPOSTAZIONI GRUPPO 〕━━━⬣
┃ 🌙 ${usedPrefix}aperto
┃ 🔐 ${usedPrefix}chiuso
┃ 📳 ${usedPrefix}modlist
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 GESTIONE UTENTI 〕━━━⬣
┃ ⚔️ ${usedPrefix}kick
┃ 🚨 ${usedPrefix}nuke
┃ 🔮 ${usedPrefix}resucita
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔗 LINK GRUPPO 〕━━━⬣
┃ 🔗 ${usedPrefix}link
┃ 📥 ${usedPrefix}prendilink
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 INFO 〕━━━⬣
┃ Categoria: Admin
┃ Versione: 1.0
┃ Status: Online ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim();

    await conn.sendMessage(message.chat, { text: testo });

};

handler.help = ['admin'];
handler.tags = ['menu'];
handler.command = /^(admin)$/i;

export default handler;
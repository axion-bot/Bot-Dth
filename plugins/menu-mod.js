const handler = async (message, { conn, usedPrefix = '.' }) => {

    const menuText = `
╭━━━〔 🛡️ MOD PANEL 〕━━━⬣
┃ 🔐 Accesso riservato ai Moderatori
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👮 COMANDI MODERATORI 〕━⬣
┃ 🧙‍♂️ ${usedPrefix}tagmod
┃ ⚡ ${usedPrefix}pingmod
┃ 🚫 ${usedPrefix}delm
┃ 💀 ${usedPrefix}nukegp
┃ ⚠️ ${usedPrefix}warnmod
┃ ✅ ${usedPrefix}unwarnmod
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 INFO 〕━⬣
┃ Versione: 1.0
┃ Status: Online ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim();
    await conn.sendMessage(message.chat, { text: menuText });
};

handler.help = ['menumod'];
handler.tags = ['menu'];
handler.command = /^(mod)$/i;

export default handler;
import os from 'os';
import { performance } from 'perf_hooks';

const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userId = message.sender;
    const userName = message.pushName || userId.split('@')[0];

    // Calcolo uptime bot
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    const totalUsers = Object.keys(global.db?.data?.users || {}).length;

    const menuText = `
╭━━━〔 🤖 NΞXSUS 𝚩𝚯𝐓 〕━━━⬣
┃ 👋 Ciao ${userId.split('@')[0]}
┃
┃ ⏱️ Uptime: ${uptimeStr}
┃ 👥 Utenti registrati: ${totalUsers}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📜 MENU PRINCIPALE 〕━━━⬣
┃
┃ 🛡️  ${usedPrefix}admin
┃     › Menu amministratori
┃
┃ 👑  ${usedPrefix}owner
┃     › Menu proprietario bot
┃
┃ 🎮  ${usedPrefix}giochi
┃     › Giochi e divertimento
┃
┃ 🧑‍⚖️  ${usedPrefix}mod
┃     › Strumenti moderatori
┃
┃ ⚙️  ${usedPrefix}funzioni
┃     › Funzioni del bot
┃
┃ 💰  ${usedPrefix}soldi
┃     › Sistema economia
┃
┃ 🖼️  ${usedPrefix}immagini
┃     › Generazione immagini
┃
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ INFO BOT 〕━━━⬣
┃ Prefix: ${usedPrefix}
┃ Owner: 𝕯𝖊ⱥ𝖉𝖑𝐲
┃ Powered by 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓
╰━━━━━━━━━━━━━━━━⬣
`.trim();
    await conn.sendMessage(message.chat, { 
        text: menuText,
        mentions: [userId] // menziona l’utente per il benvenuto
    });
};

// Funzione per convertire ms in gg:hh:mm:ss
function clockString(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}

handler.help = ['menu', 'comandi'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi)$/i;

export default handler;
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
╔═══════════════════╗
   ⚡ 𝐌𝐄𝐍𝐔 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋𝐄 ⚡
╚═══════════════════╝

👋 Benvenuto ${userName}
🤖 Bot attivo da: ${uptimeStr}
👥 Utenti registrati: ${totalUsers}

━━━━━━━━━━━━━━━━━━━━
🏠 𝐂𝐎𝐌𝐀𝐍𝐃𝐈 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋𝐈
━━━━━━━━━━━━━━━━━━━━

💂🏻 ➤ ${usedPrefix}admin — *Menu Admin*
👑 ➤ ${usedPrefix}owner — *Menu Owner*
🎮 ➤ ${usedPrefix}giochi — *Menu Giochi*
🫅🏻 ➤ ${usedPrefix}mod — *Menu Moderatori*
🚨 ➤ ${usedPrefix}funzioni — *Menu Funzioni*
📱 ➤ ${usedPrefix}soldi — *Menu Soldi*
🖼️ ➤ ${usedPrefix}immagini — *Menu Immagini*

━━━━━━━━━━━━━━━━━━━━
💀 BENVENUTO SU NΞXSUS 𝚩𝚯𝐓
━━━━━━━━━━━━━━━━━━━━
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
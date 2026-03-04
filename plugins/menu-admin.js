const handler = async (message, { conn, usedPrefix = '.' }) => {

    const testo = `
╔═══════════════╗
   ⚙️ 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 ⚙️
╚═══════════════╝

━━━━━━━━━━━━━━━━━━━━
👑 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄
━━━━━━━━━━━━━━━━━━━━

🚨 ➤ ${usedPrefix}𝐫𝐨𝐮𝐥𝐞𝐭𝐭𝐞𝐛𝐚𝐧  
🛡️ ➤ ${usedPrefix}𝐚𝐝𝐦𝐢𝐧𝐬  
✅ ➤ ${usedPrefix}𝐚𝐜𝐜𝐞𝐭𝐭𝐚  

━━━━━━━━━━━━━━━━━━━━
⚠️ 𝐖𝐀𝐑𝐍 & 𝐃𝐈𝐒𝐂𝐈𝐏𝐋𝐈𝐍𝐀
━━━━━━━━━━━━━━━━━━━━

⚠️ ➤ ${usedPrefix}𝐰𝐚𝐫𝐧  
📄 ➤ ${usedPrefix}𝐥𝐢𝐬𝐭𝐰𝐚𝐫𝐧  
✅ ➤ ${usedPrefix}𝐮𝐧𝐰𝐚𝐫𝐧  
❌ ➤ ${usedPrefix}𝐝𝐞𝐥𝐰𝐚𝐫𝐧  
🔄 ➤ ${usedPrefix}𝐫𝐞𝐬𝐞𝐭𝐰𝐚𝐫𝐧  

━━━━━━━━━━━━━━━━━━━━
🔇 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎 𝐂𝐇𝐀𝐓
━━━━━━━━━━━━━━━━━━━━

🤫 ➤ ${usedPrefix}𝐦𝐮𝐭𝐚  
🔊 ➤ ${usedPrefix}𝐬𝐦𝐮𝐭𝐚  
🏹 ➤ ${usedPrefix}𝐭𝐚𝐠  
🚨 ➤ ${usedPrefix}𝐬𝐞𝐭𝐧𝐚𝐦𝐞  

━━━━━━━━━━━━━━━━━━━━
🔒 𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐙𝐈𝐎𝐍𝐈 𝐆𝐑𝐔𝐏𝐏𝐎
━━━━━━━━━━━━━━━━━━━━

🌙 ➤ ${usedPrefix}𝐚𝐩𝐞𝐫𝐭𝐨  
🔐 ➤ ${usedPrefix}𝐜𝐡𝐢𝐮𝐬𝐨  
📳 ➤ ${usedPrefix}𝐦𝐨𝐝𝐥𝐢𝐬𝐭  

━━━━━━━━━━━━━━━━━━━━
👋 𝐔𝐓𝐄𝐍𝐓𝐈
━━━━━━━━━━━━━━━━━━━━

⚔️ ➤ ${usedPrefix}𝐤𝐢𝐜𝐤  
🚨 ➤ ${usedPrefix}𝐧𝐮𝐤𝐞  
🔮 ➤ ${usedPrefix}𝐫𝐞𝐬𝐮𝐜𝐢𝐭𝐚  

━━━━━━━━━━━━━━━━━━━━
🔗 𝐋𝐈𝐍𝐊
━━━━━━━━━━━━━━━━━━━━

🔗 ➤ ${usedPrefix}𝐥𝐢𝐧𝐤  
🚨 ➤ ${usedPrefix}𝐩𝐫𝐞𝐧𝐝𝐢𝐥𝐢𝐧𝐤  

━━━━━━━━━━━━━━━━━━━━
🔖 Versione: 1.0 🚀
━━━━━━━━━━━━━━━━━━━━
`.trim();

    await conn.sendMessage(message.chat, { text: testo });

};

handler.help = ['admin'];
handler.tags = ['menu'];
handler.command = /^(admin)$/i;

export default handler;
const handler = async (message, { conn, usedPrefix = '.' }) => {

const menuText = `
╔═════════════════╗
   🎨 𝐌𝐄𝐍𝐔 𝐈𝐌𝐌𝐀𝐆𝐈𝐍𝐈 🖼️
╚═════════════════╝

━━━━━━━━━━━━━━━━━━━━
🧪 𝐈𝐌𝐌𝐀𝐆𝐈𝐍𝐈 𝐃𝐈𝐕𝐄𝐑𝐓𝐄𝐍𝐓𝐈
━━━━━━━━━━━━━━━━━━━━

🥰 ➤ ${usedPrefix}𝐛𝐞𝐥𝐥𝐨𝐦𝐞𝐭𝐫𝐨  
🌈 ➤ ${usedPrefix}𝐠𝐚𝐲𝐦𝐞𝐭𝐫𝐨  
💖 ➤ ${usedPrefix}𝐥𝐞𝐬𝐛𝐢𝐨𝐦𝐞𝐭𝐫𝐨  
🍆 ➤ ${usedPrefix}𝐦𝐚𝐬𝐭𝐮𝐫𝐛𝐨𝐦𝐞𝐭𝐫𝐨  
🍀 ➤ ${usedPrefix}𝐟𝐨𝐫𝐭𝐮𝐧𝐨𝐦𝐞𝐭𝐫𝐨  
🧠 ➤ ${usedPrefix}𝐢𝐧𝐭𝐞𝐥𝐥𝐢𝐠𝐢𝐨𝐦𝐞𝐭𝐫𝐨  
💦 ➤ ${usedPrefix}𝐬𝐛𝐨𝐫𝐫𝐚  
❤️ ➤ ${usedPrefix}𝐢𝐥  
🕴🏻 ➤ ${usedPrefix}𝐰𝐚𝐬𝐭𝐞𝐝  
💂🏻 ➤ ${usedPrefix}𝐜𝐨𝐦𝐮𝐧𝐢𝐬𝐭𝐚  
👙 ➤ ${usedPrefix}𝐛𝐢𝐬𝐞𝐱  
🏳️‍🌈 ➤ ${usedPrefix}𝐠𝐚𝐲  
🃏 ➤ ${usedPrefix}𝐬𝐢𝐦𝐩𝐜𝐚𝐫𝐝  
🏳️‍⚧️ ➤ ${usedPrefix}𝐭𝐫𝐚𝐧𝐬  


━━━━━━━━━━━━━━━━━━━━
🔖 𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: 1.0 🚀
━━━━━━━━━━━━━━━━━━━━
`.trim();

await conn.sendMessage(message.chat, { text: menuText });

};

handler.help = ['menuimmagini'];
handler.tags = ['menu'];
handler.command = /^(immagini)$/i;

export default handler;
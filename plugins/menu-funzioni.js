const handler = async (m, { conn, usedPrefix = '.' }) => {

  const chat = global.db.data.chats[m.chat] || {}
  const bot = global.db.data.settings[conn.user.jid] || {}

  const stato = (v) => v ? '🟢 𝐨𝐧' : '🔴 𝐨𝐟𝐟'

  const testo = `
╭━━━〔 ⚡ FUNZIONI BOT 〕━━━⬣
┃ 🛠️ Controllo funzioni del gruppo
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🧰 COMANDI 〕━━━⬣
┃ 🔘 Attiva → ${usedPrefix}1 <funzione>
┃ ⚫ Disattiva → ${usedPrefix}0 <funzione>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🛡️ PROTEZIONI 〕━━━⬣
┃ 🔗 AntiLink → ${stato(chat.antiLink)}
┃ 🧱 AntiTrava → ${stato(chat.antitrava)}
┃ 💣 AntiNuke → ${stato(chat.antinuke)}
┃ 🛑 AntiSpam → ${stato(chat.antispam)}
┃ 🤖 AntiBot → ${stato(chat.antiBot)}
┃ 📸 AntiInsta → ${stato(chat.antiInsta)}
┃ ✈️ AntiTelegram → ${stato(chat.antiTelegram)}
┃ 🎵 AntiTiktok → ${stato(chat.antiTiktok)}
┃ 🏷️ AntiTag → ${stato(chat.antiTag)}
┃ 🚫 AntiGore → ${stato(chat.antigore)}
┃ 🔞 AntiPorno → ${stato(chat.antiporno)}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔒 CONTROLLO 〕━━━⬣
┃ 🛡️ SoloAdmin → ${stato(chat.modoadmin)}
┃ 👋 Benvenuto → ${stato(chat.welcome)}
┃ 🚪 Addio → ${stato(chat.goodbye)}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👑 SICUREZZA BOT 〕━━━⬣
┃ 🔒 AntiPrivato → ${stato(bot.antiprivato)}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 UTILIZZO 〕━━━⬣
┃ Attiva → ${usedPrefix}1 antifunzione
┃ Disattiva → ${usedPrefix}0 antifunzione
╰━━━━━━━━━━━━━━━━⬣
`.trim();

  await conn.sendMessage(m.chat, { text: testo })

}

handler.help = ['funzioni']
handler.tags = ['menu']
handler.command = /^(funzioni)$/i

export default handler
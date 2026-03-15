const handler = async (m, { conn, text }) => {

let who = m.mentionedJid?.[0] || m.quoted?.sender || ''

if (!who && text) {
let number = text.replace(/\D/g, '')
if (number.length >= 8) who = number + '@s.whatsapp.net'
}

if (!who)
return m.reply('❌ Devi taggare o rispondere all’utente.')

global.tempOwners = global.tempOwners || []

if (global.tempOwners.includes(who))
return m.reply(`@${who.split('@')[0]} è già owner temporaneo.`, null, { mentions: [who] })

global.tempOwners.push(who)

let thumbnail = null

try {
const pp = await conn.profilePictureUrl(who, 'image')
const res = await fetch(pp)
thumbnail = Buffer.from(await res.arrayBuffer())
} catch {}

await conn.sendMessage(m.chat, {
text: `👑 @${who.split('@')[0]} ora è owner temporaneo fino al riavvio del bot.`,
contextInfo: {
mentionedJid: [who],
externalAdReply: {
title: 'Owner aggiunto',
thumbnail: thumbnail
}
}
}, { quoted: m })

}

handler.help = ['addowner @user']
handler.tags = ['owner']
handler.command = ['addowner']
handler.rowner = true

export default handler
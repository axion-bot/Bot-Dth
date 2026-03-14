const handler = async (m, { conn, text }) => {

if (!m.isGroup)
return m.reply('❌ Questo comando funziona solo nei gruppi.')

let who = m.mentionedJid?.[0] || m.quoted?.sender || ''

if (!who && text) {
let number = text.replace(/\D/g, '')
if (number.length >= 8) who = number + '@s.whatsapp.net'
}

if (!who)
return m.reply('❌ Devi taggare o rispondere all’utente.')

const user = global.db.data.users[who]

if (!user || !user.premium || user.premiumGroup !== m.chat) {
return m.reply(`@${who.split('@')[0]} non è moderatore in questo gruppo.`, null, { mentions: [who] })
}

user.premium = false
delete user.premiumGroup

let thumbnail = null

try {
const pp = await conn.profilePictureUrl(who, 'image')
const res = await fetch(pp)
thumbnail = Buffer.from(await res.arrayBuffer())
} catch {}

await conn.sendMessage(m.chat, {
text: `@${who.split('@')[0]} non è più moderatore di questo gruppo.`,
contextInfo: {
mentionedJid: [who],
externalAdReply: {
title: '🚫 Moderatore rimosso',
thumbnail: thumbnail
}
}
}, { quoted: m })

}

handler.help = ['delmod @user']
handler.tags = ['group']
handler.command = ['delmod']
handler.group = true
handler.rowner = true

export default handler
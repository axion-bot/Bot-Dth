import fetch from 'node-fetch'

const delay = ms => new Promise(res => setTimeout(res, ms))

// anti doppio trigger
const warnCooldown = new Set()

const getThumb = async () =>
  Buffer.from(await (await fetch('https://qu.ax/fmHdc.png')).arrayBuffer())

let handler = async (m, { conn, text, command }) => {

  if (!m.isGroup) return

  let who = m.mentionedJid?.[0] || m.quoted?.sender
  if (!who) return m.reply('⚠️ Tagga o rispondi a un utente.')

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = { warn: 0 }
  }

  let user = global.db.data.users[who]
  const maxWarn = 3

  /* ================= WARN ================= */
  if (['warn', 'ammonisci'].includes(command)) {

    // 🔒 blocca doppia esecuzione
    if (warnCooldown.has(who)) return
    warnCooldown.add(who)
    setTimeout(() => warnCooldown.delete(who), 2000)

    const reason = text ? `\n❓ Motivo: ${text}` : ''

    user.warn = Math.min(user.warn + 1, maxWarn)

    if (user.warn < maxWarn) {
      await conn.sendMessage(
        m.chat,
        {
          text: `👤 @${who.split('@')[0]}\n⚠️ WARN: *${user.warn}/${maxWarn}*${reason}`,
          mentions: [who]
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: `💀 @${who.split('@')[0]} ha raggiunto ${maxWarn} warn ed è stato rimosso!`,
          mentions: [who]
        },
        { quoted: m }
      )

      user.warn = 0
      await delay(1000)
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    }
  }

  /* ================= UNWARN ================= */
  if (['unwarn', 'delwarn'].includes(command)) {

    if (user.warn <= 0)
      return m.reply('ℹ️ L’utente non ha warn attivi.')

    user.warn--

    await conn.sendMessage(
      m.chat,
      {
        text: `👤 @${who.split('@')[0]}\n⚠️ WARN: *${user.warn}/${maxWarn}*`,
        mentions: [who]
      },
      { quoted: m }
    )
  }

  /* ================= RESETWARN ================= */
  if (command === 'resetwarn') {

    if (user.warn === 0)
      return m.reply('ℹ️ L’utente non ha warn da resettare.')

    user.warn = 0

    await conn.sendMessage(
      m.chat,
      {
        text: `✅ Tutti i warn di @${who.split('@')[0]} sono stati resettati`,
        mentions: [who]
      },
      { quoted: m }
    )
  }

  /* ================= LISTWARN ================= */
  if (command === 'listwarn') {

    await conn.sendMessage(
      m.chat,
      {
        text: `📜 Warn di @${who.split('@')[0]}:\n⚠️ ${user.warn}/${maxWarn}`,
        mentions: [who]
      },
      { quoted: m }
    )
  }
}

handler.help = ['warn', 'ammonisci', 'unwarn', 'delwarn', 'resetwarn', 'listwarn']
handler.command = ['warn', 'ammonisci', 'unwarn', 'delwarn', 'resetwarn', 'listwarn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
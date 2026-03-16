let handler = async (msg, { conn, command, text, isAdmin }) => {

  const chatId = msg.chat
  const botNumber = conn.user.jid

  // prende owner dal config
  const getProtectedUsers = () => {
    let owners = (global.owner || []).map(v => {
      let number = Array.isArray(v) ? v[0] : v
      return number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    return [...owners, botNumber]
  }

  let mentionedJid = msg.mentionedJid?.[0] || msg.quoted?.sender

  // estrazione numero dal testo
  if (!mentionedJid && text) {
    if (text.endsWith('@s.whatsapp.net') || text.endsWith('@c.us')) {
      mentionedJid = text.trim()
    } else {
      let number = text.replace(/[^0-9]/g, '')
      if (number.length >= 8 && number.length <= 15) {
        mentionedJid = number + '@s.whatsapp.net'
      }
    }
  }

  const groupMetadata = await conn.groupMetadata(chatId)
  const groupOwner = groupMetadata.owner || chatId.split('-')[0] + '@s.whatsapp.net'
  const protectedUsers = getProtectedUsers()

  if (!isAdmin)
    throw '╭━━━❌━━━╮\n 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎\n╰━━━❌━━━╯\n\n𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.'

  if (!mentionedJid)
    return conn.reply(
      chatId,
      `╭━━━⚠️━━━╮
 𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎
╰━━━⚠️━━━╯

𝐓𝐚𝐠𝐠𝐚 𝐥'𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐞𝐫 ${
        command === 'warn' ? '𝐚𝐦𝐦𝐨𝐧𝐢𝐫𝐥𝐨 ⚠️' : '𝐬𝐠𝐫𝐚𝐳𝐢𝐚𝐫𝐥𝐨 ✅'
      }`,
      msg
    )

  // protezioni
  if (
    mentionedJid === groupOwner ||
    protectedUsers.includes(mentionedJid)
  )
    throw '╭━━━👑━━━╮\n 𝐀𝐙𝐈𝐎𝐍𝐄 𝐍𝐄𝐆𝐀𝐓𝐀\n╰━━━👑━━━╯\n\n🚫 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐢𝐧𝐭𝐨𝐜𝐜𝐚𝐛𝐢𝐥𝐞.'

  // inizializza utente
  if (!global.db.data.users[mentionedJid])
    global.db.data.users[mentionedJid] = { warn: 0 }

  const user = global.db.data.users[mentionedJid]
  const tag = '@' + mentionedJid.split('@')[0]

  /* ⚠️ WARN */
  if (command === 'warn') {

    user.warn = (user.warn || 0) + 1

    if (user.warn >= 3) {

      user.warn = 0

      await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove')

      return conn.sendMessage(chatId, {
        text:
`╭━━━━━━━🚨━━━━━━━╮
  ✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐄𝐒𝐏𝐔𝐋𝐒𝐎 ✦
╰━━━━━━━🚨━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}
📉 𝐌𝐨𝐭𝐢𝐯𝐨: 𝐑𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐢 𝟑/𝟑 𝐰𝐚𝐫𝐧.`,
        mentions: [mentionedJid],
      })
    }

    return conn.sendMessage(chatId, {
      text:
`╭━━━━━━━⚠️━━━━━━━╮
  ✦ 𝐖𝐀𝐑𝐍 𝐈𝐍𝐅𝐋𝐈𝐓𝐓𝐎 ✦
╰━━━━━━━⚠️━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}
📊 𝐒𝐭𝐚𝐭𝐨: ${user.warn}/𝟑 𝐰𝐚𝐫𝐧

⚠ 𝐀𝐥 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐨 𝐰𝐚𝐫𝐧 𝐯𝐞𝐫𝐫𝐚𝐢 𝐞𝐬𝐩𝐮𝐥𝐬𝐨!`,
      mentions: [mentionedJid],
    })
  }

  /* ✅ UNWARN */
  if (command === 'unwarn') {

    if (!user.warn || user.warn <= 0)
      throw '⚠️ 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐰𝐚𝐫𝐧 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.'

    user.warn -= 1

    return conn.sendMessage(chatId, {
      text:
`╭━━━━━━━✅━━━━━━━╮
  ✦ 𝐖𝐀𝐑𝐍 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ✦
╰━━━━━━━✅━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}
📊 𝐒𝐭𝐚𝐭𝐨: ${user.warn}/𝟑`,
      mentions: [mentionedJid],
    })
  }

}

handler.command = /^(warn|unwarn)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
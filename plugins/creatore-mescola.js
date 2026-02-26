var handler = async (m, { conn, participants, command }) => {

  global.db.data.groups = global.db.data.groups || {}
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {})

  if (command === 'mescoladmin') {

    if (groupData.active)
      return conn.reply(m.chat, '⚠️ Mescolamento già attivo.', m)

    let botJid = conn.user.jid

    // Admin attuali (tranne bot)
    let oldAdmins = participants
      .filter(p => p.admin && p.id !== botJid)
      .map(p => p.id)

    if (!oldAdmins.length)
      return conn.reply(m.chat, '⚠️ Nessun admin da mescolare.', m)

    let members = participants
      .filter(p => !p.admin)
      .map(p => p.id)

    if (members.length < 3)
      return conn.reply(m.chat, '⚠️ Servono almeno 3 membri non admin.', m)

    let shuffled = members.sort(() => 0.5 - Math.random())
    let newAdmins = shuffled.slice(0, 3)

    groupData.oldAdmins = oldAdmins
    groupData.tempAdmins = newAdmins
    groupData.active = true

    try {

      // 🔻 Demote uno per volta
      for (let user of oldAdmins) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
        } catch {}
      }

      // 🔺 Promote uno per volta
      for (let user of newAdmins) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        } catch {}
      }

      let tagList = newAdmins.map(u => '@' + u.split('@')[0]).join(' ')

      let msg = `
🎲 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓
👑 ADMIN MESCOLATI

Nuovi admin:
${tagList}

⏳ Fino a ripristino manuale.
`.trim()

      conn.reply(m.chat, msg, m, {
        mentions: newAdmins
      })

    } catch (e) {
      conn.reply(m.chat, '❌ Errore durante il mescolamento.', m)
    }
  }

  if (command === 'ripristinaadmin') {

    if (!groupData.active)
      return conn.reply(m.chat, '⚠️ Nessun mescolamento attivo.', m)

    try {

      // 🔻 Rimuove temporanei uno per volta
      for (let user of groupData.tempAdmins || []) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
        } catch {}
      }

      // 🔺 Ripristina originali uno per volta
      for (let user of groupData.oldAdmins || []) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        } catch {}
      }

      delete groupData.oldAdmins
      delete groupData.tempAdmins
      delete groupData.active

      conn.reply(m.chat, '✅ Admin originali ripristinati.', m)

    } catch (e) {
      conn.reply(m.chat, '❌ Errore durante il ripristino.', m)
    }
  }
}

handler.command = ['mescoladmin', 'ripristinaadmin']
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler
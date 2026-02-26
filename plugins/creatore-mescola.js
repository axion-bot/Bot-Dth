var handler = async (m, { conn, participants, command }) => {

  global.db.data.groups = global.db.data.groups || {}
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {})

  if (command === 'mescoladmin') {

    if (groupData.active)
      return conn.reply(m.chat, '⚠️ Mescolamento già attivo.', m)

    // 🔹 Prende admin attuali (tranne bot)
    let oldAdmins = participants
      .filter(p => p.admin && p.id !== conn.user.jid)
      .map(p => p.id)

    if (!oldAdmins.length)
      return conn.reply(m.chat, '⚠️ Nessun admin da mescolare.', m)

    // 🔹 Membri normali
    let members = participants
      .filter(p => !p.admin)
      .map(p => p.id)

    if (members.length < 3)
      return conn.reply(m.chat, '⚠️ Servono almeno 3 membri non admin.', m)

    // 🔹 Mischia casualmente
    let shuffled = members.sort(() => 0.5 - Math.random())
    let newAdmins = shuffled.slice(0, 3)

    groupData.oldAdmins = oldAdmins
    groupData.tempAdmins = newAdmins
    groupData.active = true

    try {
      // Retrocede vecchi
      await conn.groupParticipantsUpdate(m.chat, oldAdmins, 'demote')

      // Promuove nuovi
      await conn.groupParticipantsUpdate(m.chat, newAdmins, 'promote')

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
      // Rimuove temporanei
      await conn.groupParticipantsUpdate(m.chat, groupData.tempAdmins, 'demote')

      // Ripristina originali
      await conn.groupParticipantsUpdate(m.chat, groupData.oldAdmins, 'promote')

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
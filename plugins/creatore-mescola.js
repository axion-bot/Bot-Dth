const handler = async (m, { conn, participants, command }) => {
  if (!m.isGroup) return m.reply('⚠️ Solo nei gruppi.');

  // 🔥 OWNER AUTOMATICI
  const BOT_OWNERS = (global.owner || []).map(o =>
    o[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  );

  if (!BOT_OWNERS.includes(m.sender))
    return m.reply('🚫 Solo l’OWNER del bot può usare questo comando.');

  // 🔥 Controllo BOT ADMIN sicuro
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const botIsAdmin = participants.find(p => p.id === botJid)?.admin;

  if (!botIsAdmin)
    return m.reply('⚠️ Il bot deve essere admin nel gruppo.');

  global.db.data.groups = global.db.data.groups || {};
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {});

  // 🔥 Prende founder automaticamente
  let founderJid = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    founderJid = metadata.owner;
  } catch {}

  if (command === 'mescoladmin') {

    if (groupData.shuffleActive)
      return m.reply('⚠️ Mescolamento già attivo.');

    // Admin attuali (escludi bot, owner e founder)
    const oldAdmins = participants
      .filter(p =>
        p.admin &&
        p.id !== botJid &&
        !BOT_OWNERS.includes(p.id) &&
        p.id !== founderJid
      )
      .map(p => p.id);

    if (!oldAdmins.length)
      return m.reply('⚠️ Nessun admin valido da mescolare.');

    // Membri normali
    const members = participants
      .filter(p => !p.admin)
      .map(p => p.id);

    if (members.length < 3)
      return m.reply('⚠️ Servono almeno 3 membri non admin.');

    // Mischia casualmente
    const shuffled = members.sort(() => 0.5 - Math.random());
    const newAdmins = shuffled.slice(0, 3);

    groupData.oldAdmins = oldAdmins;
    groupData.tempAdmins = newAdmins;
    groupData.shuffleActive = true;

    // 🔻 Demote vecchi admin
    for (let user of oldAdmins) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
      } catch {}
    }

    // 🔺 Promote nuovi admin
    for (let user of newAdmins) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
      } catch {}
    }

    return conn.sendMessage(m.chat, {
      text:
`🎲 *ADMIN MESCOLATI!*

👑 Nuovi admin temporanei:
${newAdmins.map(u => '@' + u.split('@')[0]).join('\n')}

⏳ Fino a ripristino manuale.`,
      mentions: newAdmins
    }, { quoted: m });
  }

  if (command === 'ripristinaadmin') {

    if (!groupData.shuffleActive)
      return m.reply('⚠️ Nessun mescolamento attivo.');

    // 🔻 Rimuove admin temporanei
    for (let user of groupData.tempAdmins || []) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
      } catch {}
    }

    // 🔺 Ripristina admin originali (solo se ancora nel gruppo)
    const currentMembers = participants.map(p => p.id);

    for (let user of groupData.oldAdmins || []) {
      if (currentMembers.includes(user)) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
        } catch {}
      }
    }

    delete groupData.oldAdmins;
    delete groupData.tempAdmins;
    delete groupData.shuffleActive;

    return m.reply('✅ Admin originali ripristinati con successo.');
  }
};

handler.help = ['mescoladmin', 'ripristinaadmin'];
handler.tags = ['group'];
handler.command = ['mescoladmin', 'ripristinaadmin'];
handler.group = true;

export default handler;
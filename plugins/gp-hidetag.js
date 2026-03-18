// ================= FORMAT DURATA =================
function formatDuration(ms) {
  if (ms < 0) ms = -ms;
  const time = {
    giorni: Math.floor(ms / 86400000),
    ore: Math.floor(ms / 3600000) % 24,
    minuti: Math.floor(ms / 60000) % 60,
  };
  return Object.entries(time)
    .filter(([_, val]) => val !== 0)
    .map(([key, val]) => `${val} ${key}`)
    .join(', ');
}

// 🔥 NORMALIZZA JID
function fixJid(jid) {
  return jid.split(':')[0] + '@s.whatsapp.net';
}

let handler = async (m, { conn, text, participants, command, isAdmin }) => {
  try {
    let usersDB = global.db.data.users;

    // ================= INIT UTENTE =================
    let sender = fixJid(m.sender);

    if (!usersDB[sender]) {
      usersDB[sender] = {
        afk: false,
        afkReason: '',
        afkSince: 0
      };
    }

    let user = usersDB[sender];

    // ================= AFK =================
    if (command === 'afk') {
      if (user.afk) {
        user.afk = false;
        user.afkReason = '';
        user.afkSince = 0;

        return conn.reply(m.chat, '✅ Sei tornato attivo! Bentornato 👋', m);
      }

      user.afk = true;
      user.afkReason = text ? text.trim() : 'Nessun motivo';
      user.afkSince = Date.now();

      return conn.reply(
        m.chat,
        `💤 Sei ora AFK\n📝 Motivo: ${user.afkReason}`,
        m
      );
    }

    // ================= AFK LIST =================
    if (command === 'afklist' || command === 'listafk') {
      let afkUsers = [];

      for (let jid in usersDB) {
        if (usersDB[jid].afk) {
          afkUsers.push({
            id: jid,
            reason: usersDB[jid].afkReason,
            since: usersDB[jid].afkSince
          });
        }
      }

      if (!afkUsers.length) {
        return conn.reply(m.chat, 'ℹ️ Nessun utente AFK.', m);
      }

      let teks = '👥 *Lista utenti AFK*\n\n';
      let mentions = [];

      for (let u of afkUsers) {
        let dur = formatDuration(Date.now() - u.since);

        teks += `• @${u.id.split('@')[0]}\n`;
        teks += `   📝 Motivo: ${u.reason}\n`;
        teks += `   ⏰ Da: ${dur}\n\n`;

        mentions.push(u.id);
      }

      return conn.sendMessage(m.chat, {
        text: teks.trim(),
        mentions
      }, { quoted: m });
    }

    // ================= CLEAR AFK =================
    if (command === 'clearafk') {
      if (!isAdmin) {
        return conn.reply(
          m.chat,
          '⚠️ Solo gli admin possono usare questo comando.',
          m
        );
      }

      let cleared = 0;

      for (let jid in usersDB) {
        if (usersDB[jid].afk) {
          usersDB[jid].afk = false;
          usersDB[jid].afkReason = '';
          usersDB[jid].afkSince = 0;
          cleared++;
        }
      }

      if (!cleared) {
        return conn.reply(m.chat, 'ℹ️ Nessun AFK da rimuovere.', m);
      }

      return conn.reply(
        m.chat,
        `✅ Rimossi *${cleared}* utenti AFK.`,
        m
      );
    }

    // ================= HIDETAG / TAG =================
    if (/^(hidetag|totag|tag)$/i.test(command)) {

      // 🔥 FILTRO AFK FIXATO
      const users = participants
        .map((u) => fixJid(conn.decodeJid(u.id)))
        .filter((jid) => {
          if (!usersDB[jid]) {
            usersDB[jid] = {
              afk: false,
              afkReason: '',
              afkSince: 0
            };
          }
          return !usersDB[jid].afk;
        });

      if (m.quoted) {
        const quoted = m.quoted;

        if (quoted.mtype === 'imageMessage') {
          const media = await quoted.download();
          return conn.sendMessage(m.chat, {
            image: media,
            caption: text || quoted.text || '',
            mentions: users
          }, { quoted: m });
        }

        else if (quoted.mtype === 'videoMessage') {
          const media = await quoted.download();
          return conn.sendMessage(m.chat, {
            video: media,
            caption: text || quoted.text || '',
            mentions: users
          }, { quoted: m });
        }

        else if (quoted.mtype === 'audioMessage') {
          const media = await quoted.download();
          return conn.sendMessage(m.chat, {
            audio: media,
            mimetype: 'audio/mp4',
            mentions: users
          }, { quoted: m });
        }

        else if (quoted.mtype === 'documentMessage') {
          const media = await quoted.download();
          return conn.sendMessage(m.chat, {
            document: media,
            mimetype: quoted.mimetype,
            fileName: quoted.fileName,
            caption: text || quoted.text || '',
            mentions: users
          }, { quoted: m });
        }

        else if (quoted.mtype === 'stickerMessage') {
          const media = await quoted.download();
          return conn.sendMessage(m.chat, {
            sticker: media,
            mentions: users
          }, { quoted: m });
        }

        else {
          return conn.sendMessage(m.chat, {
            text: quoted.text || text || '',
            mentions: users
          }, { quoted: m });
        }
      }

      else if (text) {
        return conn.sendMessage(m.chat, {
          text: text,
          mentions: users
        }, { quoted: m });
      }

      else {
        return m.reply('❌ Inserisci testo o rispondi a un messaggio');
      }
    }

  } catch (e) {
    console.error('Errore plugin:', e);
    m.reply('❌ Si è verificato un errore');
  }
};

// ================= CONFIG =================
handler.help = [
  'hidetag',
  'tag',
  'afk [motivo]',
  'afklist',
  'clearafk'
];

handler.tags = ['group'];
handler.command = /^(hidetag|totag|tag|afk|afklist|listafk|clearafk)$/i;
handler.group = true;

export default handler;

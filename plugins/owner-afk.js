// AFK SYSTEM - Baileys Varebased

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

let handler = async (m, { conn, command, text, isAdmin }) => {

  let users = global.db.data.users;
  let user = users[m.sender];

  if (!user) {
    users[m.sender] = {
      afk: false,
      afkReason: '',
      afkSince: 0
    };
    user = users[m.sender];
  }

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

    for (let jid in users) {
      if (users[jid].afk) {
        afkUsers.push({
          id: jid,
          reason: users[jid].afkReason,
          since: users[jid].afkSince
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

    for (let jid in users) {
      if (users[jid].afk) {
        users[jid].afk = false;
        users[jid].afkReason = '';
        users[jid].afkSince = 0;
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
};

handler.help = ['afk [motivo]', 'afklist', 'clearafk'];
handler.tags = ['group'];
handler.command = /^(afk|afklist|listafk|clearafk)$/i;
handler.group = true;

export default handler;

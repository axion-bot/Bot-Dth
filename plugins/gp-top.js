
import fs from 'fs';

const DB_PATH = './database.json';

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}

let handler = async (m, { conn, command }) => {
  let db = loadDB();
  let users = db.users || {};

  // prendi partecipanti del gruppo
  let metadata = await conn.groupMetadata(m.chat);
  let partecipanti = metadata.participants.map(p => p.id);

  if (!users || Object.keys(users).length === 0) {
    return m.reply("📊 *CLASSIFICA*\n\nNessun dato disponibile.");
  }

  let limite = 3;
  if (command === "top5") limite = 5;
  if (command === "top10") limite = 10;

  // filtra solo utenti del gruppo
  let classifica = Object.entries(users)
    .filter(([id]) => partecipanti.includes(id))
    .map(([id, data]) => ({
      id,
      messaggi: data.messages || 0
    }))
    .sort((a, b) => b.messaggi - a.messaggi)
    .slice(0, limite);

  if (classifica.length === 0) {
    return m.reply("📊 Nessun utente del gruppo ha messaggi registrati.");
  }

  const medaglie = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅'];

  let testo = `╭━━━〔 📊 *CLASSIFICA GRUPPO* 📊 〕━━━⬣\n`;
  testo += `┃ 👥 Utenti analizzati: *${classifica.length}*\n`;
  testo += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
  testo += `🏆 *TOP ${limite}*\n\n`;

  let menzioni = [];

  classifica.forEach((u, i) => {
    menzioni.push(u.id);
    testo += `${medaglie[i]} @${u.id.split("@")[0]}\n`;
    testo += `   ✉️ ${u.messaggi} messaggi\n\n`;
  });

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni
  }, { quoted: m });
};

handler.help = ['top','top5','top10'];
handler.tags = ['strumenti'];
handler.command = /^(top|top5|top10)$/i;
handler.group = true;

export default handler;
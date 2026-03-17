let handler = async (m, { conn, command }) => {
  // Accediamo ai dati della chat corrente nel database.json
  let chat = global.db.data.chats[m.chat]
  if (!chat) return 
  
  // Recuperiamo l'archivio (o creiamolo se vuoto)
  let dati = chat.archivioMessaggi || { totali: 0, utenti: {} }

  if (!dati || dati.totali === 0) {
    return m.reply("📊 *CLASSIFICA MESSAGGI*\n\nNessun messaggio registrato oggi in questo gruppo.");
  }

  // Configurazione limite visualizzazione
  let limite = command === "top5" ? 5 : (command === "top10" ? 10 : 3);

  // Ordiniamo gli utenti per numero di messaggi
  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite);

  const medaglie = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅'];

  let testo = `╭━━━〔 📊 *CLASSIFICA* 📊 〕━━━⬣\n`;
  testo += `┃ 💬 Messaggi totali: *${dati.totali}*\n`;
  testo += `┃ 📅 Database: . /database.json\n`;
  testo += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
  testo += `🏆 *TOP ${limite} DI OGGI*\n\n`;

  let menzioni = classifica.map(u => u[0]);

  classifica.forEach((u, i) => {
    testo += `${medaglie[i]} @${u[0].split("@")[0]}\n`;
    testo += `   ✉️ ${u[1].conteggio} messaggi\n\n`;
  });

  testo += `──────────────────\n`;
  testo += `⏳ _Il conteggio si azzera a mezzanotte_`;

  await conn.sendMessage(m.chat, { text: testo, mentions: menzioni }, { quoted: m });
};

// --- LOGICA DI REGISTRAZIONE (Prima di ogni comando) ---
handler.before = async function (m) {
  // Filtri: No chat private, no messaggi dai bot
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 

  // Inizializzazione sicura nel database.json
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].archivioMessaggi) {
    global.db.data.chats[m.chat].archivioMessaggi = { totali: 0, utenti: {} };
  }

  let archivio = global.db.data.chats[m.chat].archivioMessaggi;

  // Incremento contatore globale chat
  archivio.totali += 1;

  // Incremento contatore utente
  if (!archivio.utenti[m.sender]) {
    archivio.utenti[m.sender] = { conteggio: 0 };
  }
  archivio.utenti[m.sender].conteggio += 1;
  
  // Il sistema 'autosaver' del tuo bot scriverà le modifiche su database.json automaticamente
};

// --- RESET AUTOMATICO (Mezzanotte) ---
setInterval(async () => {
  let now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    let chats = global.db.data.chats;

    for (let jid in chats) {
      let dati = chats[jid].archivioMessaggi;
      if (!dati || dati.totali === 0) continue;

      let classifica = Object.entries(dati.utenti)
        .sort((a, b) => b[1].conteggio - a[1].conteggio)
        .slice(0, 3);

      let testo = `╭━━━〔 🏆 *FINALE GIORNALIERO* 🏆 〕━⬣\n`;
      testo += `┃ 📊 Messaggi oggi: *${dati.totali}*\n`;
      testo += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

      let menzioni = classifica.map(u => u[0]);
      const medaglie = ['🥇','🥈','🥉'];

      classifica.forEach((u, i) => {
        testo += `${medaglie[i]} @${u[0].split("@")[0]} — ${u[1].conteggio} messaggi\n`;
      });

      testo += `\n🔄 Database azzerato. Si ricomincia!`;

      if (global.conn) await global.conn.sendMessage(jid, { text: testo, mentions: menzioni });

      // Svuota i dati nel JSON
      chats[jid].archivioMessaggi = { totali: 0, utenti: {} };
    }
  }
}, 60000); 

handler.help = ['top','top5','top10'];
handler.tags = ['strumenti'];
handler.command = /^(top|top5|top10)$/i;
handler.group = true;

export default handler;

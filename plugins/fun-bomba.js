let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('⚠️ Solo nei gruppi, soldato!');
  
  conn.bomba = conn.bomba ? conn.bomba : {};
  if (conn.bomba[m.chat]) return m.reply('💣 C\'è già un ordigno attivo! Passalo prima che esploda!');

  // Trova la prima vittima (Tag o Risposta)
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
  
  // Se non c'è tag, sceglie un partecipante a caso (escludendo il bot)
  if (!target) {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const filtered = participants.filter(p => p !== botNumber);
    target = filtered[Math.floor(Math.random() * filtered.length)];
  }

  // PULIZIA ID per visualizzazione estetica
  const targetTag = '@' + target.split('@')[0];
  const timer = Math.floor(Math.random() * (40 - 20 + 1) + 20) * 1000;

  conn.bomba[m.chat] = {
    vittima: target,
    scadenza: Date.now() + timer,
    attiva: true
  };

  const startMsg = `
╭━━━ ☢️ *PANIC MODE* ☢️ ━━━╮
┃
┃ 🏃‍♂️ *BERSAGLIO:* ${targetTag}
┃ 🧨 *STATUS:* INNESCATA
┃ ⚡ *AZIONE:* Scrivi *${usedPrefix}passa @tag*
┃
┃ ⏱️ *TIMER:* [ CRIPTATO ]
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  await conn.sendMessage(m.chat, { 
    text: startMsg, 
    mentions: [target] 
  }, { quoted: m });

  // Gestione esplosione
  setTimeout(async () => {
    if (conn.bomba[m.chat] && conn.bomba[m.chat].attiva) {
      const sfigato = conn.bomba[m.chat].vittima;
      const sfigatoTag = '@' + sfigato.split('@')[0];
      
      const boomMsg = `
💥 *ＢＯＯＯＯＯＭ* 💥
━━━━━━━━━━━━━━━━━━━━━━━━━━
L'ordigno è esploso tra le mani di ${sfigatoTag}!

📊 *REPORT FINALE:*
• Onore: Ridotto in cenere 🔥
• Velocità: Troppo lento 🐌
• Distanza di fuga: **3.750 passi** (2,5 km)

💀 *ADDIO, ${sfigatoTag}!*
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      await conn.sendMessage(m.chat, { 
        text: boomMsg, 
        mentions: [sfigato] 
      });
      delete conn.bomba[m.chat];
    }
  }, timer);
};

// --- LOGICA DI PASSAGGIO ---
handler.before = async (m, { conn }) => {
  conn.bomba = conn.bomba ? conn.bomba : {};
  if (!m.isGroup || !conn.bomba[m.chat]) return;

  const game = conn.bomba[m.chat];

  // Risponde solo se il messaggio inizia con .passa e chi scrive ha la bomba
  if (m.text.toLowerCase().startsWith('.passa')) {
    if (m.sender !== game.vittima) return;

    let nextTarget = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
    
    if (!nextTarget) return m.reply('🎯 Tagga qualcuno per passargli la bomba!');
    if (nextTarget === m.sender) return m.reply('🤡 Non puoi passarla a te stesso!');
    
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    if (nextTarget === botNumber) return m.reply('😏 Nice try. Passala a un umano!');

    // Aggiorna la vittima e pulisce l'ID per il messaggio
    game.vittima = nextTarget;
    const nextTag = '@' + nextTarget.split('@')[0];
    
    await conn.sendMessage(m.chat, {
      text: `⚡ *RIFLESSI PRONTI!*\n\nLa bomba è volata nelle mani di ${nextTag}! 🏃‍♂️💨`,
      mentions: [nextTarget]
    });
  }
};

handler.help = ['bomba'];
handler.tags = ['giochi'];
handler.command = /^(bomba|passa)$/i;
handler.group = true;

export default handler;

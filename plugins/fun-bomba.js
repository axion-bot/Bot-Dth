let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('⚠️ Solo nei gruppi, soldato!');
  
  conn.bomba = conn.bomba ? conn.bomba : {};
  if (conn.bomba[m.chat]) return m.reply('💣 C\'è già un ordigno attivo! Passalo prima che esploda!');

  // Trova la prima vittima
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
  if (!target) {
    const participants = (await conn.groupMetadata(m.chat)).participants;
    target = participants[Math.floor(Math.random() * participants.length)].id;
  }

  const targetName = '@' + target.split('@')[0];
  const timer = Math.floor(Math.random() * (40 - 20 + 1) + 20) * 1000; // 20-40 secondi

  conn.bomba[m.chat] = {
    vittima: target,
    scadenza: Date.now() + timer,
    attiva: true
  };

  const startMsg = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   💣 *ＰＡＮＩＣ  ＭＯＤＥ* 💣
┗━━━━━━━━━━━━━━━━━━━━━┛
┃
┃ 🏃‍♂️ *CORRI:* ${targetName}
┃ 🧨 *STATUS:* INNESCATA
┃
┃ ⚠️ *COME SALVARSI:*
┃ Scrivi *${usedPrefix}passa* taggando qualcuno!
┃
┃ ⏱️ *TIMER:* [ CRIPTATO ]
┗━━━━━━━━━━━━━━━━━━━━━┛`;

  await conn.sendMessage(m.chat, { text: startMsg, mentions: [target] }, { quoted: m });

  // Gestione esplosione
  setTimeout(async () => {
    if (conn.bomba[m.chat] && conn.bomba[m.chat].attiva) {
      const sfigato = conn.bomba[m.chat].vittima;
      const sfigatoTag = '@' + sfigato.split('@')[0];
      
      const boomMsg = `
💥 *ＢＯＯＯＯＯＭ* 💥
━━━━━━━━━━━━━━━━━━━━
L'ordigno è esploso tra le mani di ${sfigatoTag}!

📊 *DANNI:*
• Vestiti: Bruciati 👕
• Onore: Scomparso 📉
• Fuga: Servono **3.750 passi** (2,5 km)

💀 *ADDIO, ${sfigatoTag}!*
━━━━━━━━━━━━━━━━━━━━`;

      await conn.sendMessage(m.chat, { text: boomMsg, mentions: [sfigato] });
      delete conn.bomba[m.chat];
    }
  }, timer);
};

// --- LOGICA DI PASSAGGIO ---
handler.before = async (m, { conn }) => {
  conn.bomba = conn.bomba ? conn.bomba : {};
  if (!m.isGroup || !conn.bomba[m.chat] || !m.text.toLowerCase().startsWith('.passa')) return;

  const game = conn.bomba[m.chat];
  
  // Controllo identità (molto più preciso)
  if (m.sender !== game.vittima) return; 

  let nextTarget = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
  
  if (!nextTarget) return m.reply('🎯 Tagga qualcuno per passargli la patata bollente!');
  if (nextTarget === m.sender) return m.reply('🤡 Non puoi passarla a te stesso!');
  
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (nextTarget === botNumber) return m.reply('😏 Nice try. Passala a un umano!');

  // Aggiorna la vittima
  game.vittima = nextTarget;
  const nextTag = '@' + nextTarget.split('@')[0];
  
  await conn.sendMessage(m.chat, {
    text: `⚡ *PASSAGGIO REAZIONARIO!*\n\nOra la bomba ce l'ha ${nextTag}! MUOVITI! 🏃‍♂️💨`,
    mentions: [nextTarget]
  });
};

handler.help = ['bomba'];
handler.tags = ['giochi'];
handler.command = /^(bomba)$/i;
handler.group = true;

export default handler;

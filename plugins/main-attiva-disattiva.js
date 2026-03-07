import fs from 'fs';

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner }) => {

  const isEnable = /attiva|enable|on|1/i.test(command);
  const chats = global.db.data.chats;
  const settings = global.db.data.settings;

  chats[m.chat] ??= {};
  settings[conn.user.jid] ??= {};

  const chat = chats[m.chat];
  const bot = settings[conn.user.jid];

  // ================== RECUPERO IMMAGINE PROFILO ==================
  let pp;
  try { 
    pp = await conn.profilePictureUrl(m.sender, 'image'); 
  } catch { 
    pp = null; 
  }

  // Funzione per convertire l'URL in Buffer (senza fallback locale)
  const getBuffer = async (url) => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  };

  const profileBuffer = await getBuffer(pp);

  // ================== GRAFICA BOX ==================
  const box = (title, stato, desc) => `
╔═══════════════════╗
║ ⚡ NΞXSUS • ${title} ⚡
╠═══════════════════╣
║ Stato: ${stato}
║ ${desc}
╚═══════════════════╝`.trim();

  const noAdmin = box('ACCESSO NEGATO', '❌ Solo Admin', 'Rituale proibito');
  const noOwner = box('POTERE SUPREMO', '👑 Solo Owner', 'Autorità insufficiente');

  if (!args[0]) {
    throw box(
      'RITUALE DI COMANDO',
      'ℹ️ Usa: .attiva <funzione>',
      'antilink, antispam, antibot, antiporno, antigore, modoadmin, benvenuto, addio, antiprivato, antinuke, antiinsta, antitelegram, antitiktok, antitag, antitrava'
    );
  }

  let feature = args[0].toLowerCase();
  let result = '';

  // ================== SWITCH FUNZIONI ==================
  switch(feature) {
    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiLink === isEnable) return m.reply(box('🔗 ANTILINK', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiLink = isEnable;
      result = box('🔗 ANTILINK', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca link WhatsApp');
      break;

    case 'antiinsta':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiInsta === isEnable) return m.reply(box('📸 ANTIINSTA', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiInsta = isEnable;
      result = box('📸 ANTIINSTA', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca link Instagram');
      break;

    case 'antitelegram':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiTelegram === isEnable) return m.reply(box('✈️ ANTITELEGRAM', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiTelegram = isEnable;
      result = box('✈️ ANTITELEGRAM', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca link Telegram');
      break;

    case 'antitiktok':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiTiktok === isEnable) return m.reply(box('🎵 ANTITIKTOK', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiTiktok = isEnable;
      result = box('🎵 ANTITIKTOK', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca link TikTok');
      break;

    case 'antitag':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiTag === isEnable) return m.reply(box('🏷️ ANTITAG', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiTag = isEnable;
      result = box('🏷️ ANTITAG', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca menzioni di massa');
      break;

    case 'antinuke':
      if (!isOwner && !isROwner) return m.reply(noOwner);
      if (chat.antinuke === isEnable) return m.reply(box('💣 ANTINUKE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antinuke = isEnable;
      result = box('💣 ANTINUKE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Protezione distruzione');
      break;

    case 'antigore':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antigore === isEnable) return m.reply(box('🚫 ANTIGORE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antigore = isEnable;
      result = box('🚫 ANTIGORE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Filtro contenuti violenti');
      break;

    case 'antiporno':
    case 'antiporn':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiporno === isEnable) return m.reply(box('🔞 ANTIPORNO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiporno = isEnable;
      result = box('🔞 ANTIPORNO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Protezione NSFW');
      break;

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.modoadmin = isEnable;
      result = box('🛡️ MODO ADMIN', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Comandi solo per staff');
      break;

    case 'benvenuto':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.welcome = isEnable;
      result = box('👋 WELCOME', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Messaggi d\'ingresso');
      break;

    case 'addio':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.goodbye = isEnable;
      result = box('🚪 GOODBYE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Messaggi d\'uscita');
      break;

    case 'antiprivato':
      if (!isOwner && !isROwner) return m.reply(noOwner);
      bot.antiprivato = isEnable;
      result = box('🔒 ANTIPRIVATO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca DM');
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiBot = isEnable;
      result = box('🤖 ANTIBOT', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca altri bot');
      break;

    case 'antispam':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antispam = isEnable;
      result = box('🛑 ANTISPAM', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Protezione flood');
      break;

    case 'antitrava':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antitrava = isEnable;
      result = box('🧱 ANTITRAVA', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca messaggi crash');
      break;

    default:
      return m.reply(box('❓ SCONOSCIUTO', '⚠️ Errore', 'Funzione non trovata'));
  }

  // ================== INVIO CON GRAFICA PICCOLA ==================
  await conn.sendMessage(m.chat, {
    text: result,
    contextInfo: {
      externalAdReply: {
        title: 'NΞXSUS SYSTEM CONTROL',
        body: `Richiesto da: ${m.pushName}`,
        thumbnail: profileBuffer, // Miniatura dinamica (null se non esiste)
        sourceUrl: '', 
        mediaType: 1,
        renderLargerThumbnail: false // Mantiene l'immagine piccola come richiesto
      }
    }
  }, { quoted: m });
};

handler.help = ['attiva','disattiva'];
handler.tags = ['group'];
handler.command = ['attiva','disattiva','enable','disable','on','off','1','0'];

export default handler;

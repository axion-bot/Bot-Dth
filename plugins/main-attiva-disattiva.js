import fs from 'fs';

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner }) => {

  const isEnable = /attiva|enable|on|1/i.test(command);
  const chats = global.db.data.chats;
  const settings = global.db.data.settings;

  chats[m.chat] ??= {};
  settings[conn.user.jid] ??= {};

  const chat = chats[m.chat];
  const bot = settings[conn.user.jid];

  // ================== THUMBNAIL PROFILO ==================
  let pp;
  try { 
    pp = await conn.profilePictureUrl(m.sender, 'image'); 
  } catch { 
    pp = null; 
  }

  // ================== GRAFICA ==================
  const box = (title, stato, desc) => `
╔═══════════════════╗
║ ⚡ NΞXSUS • ${title} ⚡
╠═══════════════════╣
║ Stato: ${stato}
║ ${desc}
╚═══════════════════╝`.trim();

  const noAdmin = box('ACCESSO NEGATO', '❌ Solo Admin possono modificare', 'Rituale proibito');
  const noOwner = box('POTERE SUPREMO', '👑 Solo Owner può modificare', 'Autorità insufficiente');

  if (!args[0]) {
    throw box(
      'RITUALE DI COMANDO',
      'ℹ️ Usa: .attiva <funzione> / .disattiva <funzione>',
      'Funzioni disponibili: antilink, antispam, antibot, antiporno, antigore, modoadmin, benvenuto, addio, antiprivato, antinuke, antiinsta, antitelegram, antitiktok, antitag, antitrava'
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
      result = box('🔗 ANTILINK', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca link WhatsApp e portali proibiti');
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
      result = box('💣 ANTINUKE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Protezione distruzione di massa');
      break;

    case 'antigore':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antigore === isEnable) return m.reply(box('🚫 ANTIGORE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antigore = isEnable;
      result = box('🚫 ANTIGORE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Purificazione contenuti violenti');
      break;

    case 'antiporno':
    case 'antiporn':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiporno === isEnable) return m.reply(box('🔞 ANTIPORNO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiporno = isEnable;
      result = box('🔞 ANTIPORNO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Protezione contenuti proibiti');
      break;

    case 'modoadmin':
    case 'soloadmin':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.modoadmin === isEnable) return m.reply(box('🛡️ MODO ADMIN', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.modoadmin = isEnable;
      result = box('🛡️ MODO ADMIN', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Solo admin può usare comandi Nexus');
      break;

    case 'benvenuto':
    case 'welcome':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.welcome === isEnable) return m.reply(box('👋 WELCOME', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.welcome = isEnable;
      result = box('👋 WELCOME', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Messaggio di benvenuto attivo');
      break;

    case 'addio':
    case 'goodbye':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.goodbye === isEnable) return m.reply(box('🚪 GOODBYE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.goodbye = isEnable;
      result = box('🚪 GOODBYE', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Messaggio di congedo attivo');
      break;

    case 'antiprivato':
      if (!isOwner && !isROwner) return m.reply(noOwner);
      if (bot.antiprivato === isEnable) return m.reply(box('🔒 ANTIPRIVATO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      bot.antiprivato = isEnable;
      result = box('🔒 ANTIPRIVATO', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca messaggi privati al bot');
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antiBot === isEnable) return m.reply(box('🤖 ANTIBOT', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antiBot = isEnable;
      result = box('🤖 ANTIBOT', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca bot esterni non autorizzati');
      break;

    case 'antispam':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antispam === isEnable) return m.reply(box('🛑 ANTISPAM', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antispam = isEnable;
      result = box('🛑 ANTISPAM', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Protezione contro spam e flood');
      break;

    case 'antitrava':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      if (chat.antitrava === isEnable) return m.reply(box('🧱 ANTITRAVA', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Lo stato è già impostato'));
      chat.antitrava = isEnable;
      result = box('🧱 ANTITRAVA', (isEnable ? '🟢 ATTIVO' : '🔴 DISATTIVO'), 'Blocca messaggi crash e trappole');
      break;

    default:
      return m.reply(box('❓ FUNZIONE SCONOSCIUTA', '⚠️ Nessun rituale corrispondente', 'Verifica il nome della funzione'));
  }

  // ================== INVIO ==================
  await conn.sendMessage(m.chat, {
    image: { url: pp || undefined }, // nessun fallback
    caption: result,
    footer: '📋 Menu rapido NΞXSUS',
    buttons: [
      { buttonId: '.funzioni', buttonText: { displayText: '📋 Funzioni' }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m });
};

handler.help = ['attiva','disattiva'];
handler.tags = ['group'];
handler.command = ['attiva','disattiva','enable','disable','on','off','1','0'];
handler.group = false;

export default handler;
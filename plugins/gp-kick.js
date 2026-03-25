import fs from 'fs';
import fetch from 'node-fetch';

async function handler(m, { isBotAdmin, isOwner, text, conn }) {
  if (!isBotAdmin) return m.reply('❌ *Devi essere admin*');

  const mention = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!mention) return m.reply('❌ *Menziona un utente*');

  const ownerBot = global.owner[0][0] + '@s.whatsapp.net';
  if (mention === ownerBot) return m.reply('❌ *Non toccare il creatore*');
  if (mention === conn.user.jid) return m.reply('❌ *Non posso auto-espellermi*');
  if (mention === m.sender) return m.reply('❌ *Non puoi espellere te stesso*');

  const groupMetadata = conn.chats[m.chat].metadata;
  const participants = groupMetadata.participants;
  const utente = participants.find(u => conn.decodeJid(u.id) === mention);

  if (utente?.admin === 'superadmin') return m.reply('❌ *Non puoi rimuovere il creatore*');
  if (utente?.admin === 'admin') return m.reply('❌ *Non puoi rimuovere un admin*');

  await conn.groupParticipantsUpdate(m.chat, [mention], 'remove');
}

handler.customPrefix = /^(kick|avadakedavra|sparisci|puffo)\b/i;
handler.command = new RegExp;
handler.admin = true;

export default handler;

const handler = async (m, { conn, text, participants }) => {
  try {
    const excluded = '393516908130@s.whatsapp.net';

    // utenti da menzionare (escluso ankush)
    const users = participants
      .map(u => conn.decodeJid(u.id))
      .filter(jid => jid !== excluded);

    let content = {};

    if (m.quoted) {
      const quoted = m.quoted;
      const media = await quoted.download?.();

      if (quoted.mtype === 'imageMessage') content = { image: media, caption: text || quoted.text || '' };
      else if (quoted.mtype === 'videoMessage') content = { video: media, caption: text || quoted.text || '' };
      else if (quoted.mtype === 'audioMessage') content = { audio: media, mimetype: 'audio/mp4' };
      else if (quoted.mtype === 'documentMessage') content = { document: media, mimetype: quoted.mimetype, fileName: quoted.fileName, caption: text || quoted.text || '' };
      else if (quoted.mtype === 'stickerMessage') content = { sticker: media };
      else content = { text: quoted.text || text || '' };
    } else if (text) {
      content = { text };
    } else {
      return m.reply('❌ *Inserisci un testo o rispondi a un messaggio/media*');
    }

    // invia senza quoted per evitare menzione automatica
    await conn.sendMessage(m.chat, content, {
      contextInfo: { mentionedJid: users }
    });

  } catch (e) {
    console.error(e);
    m.reply('❌ Si è verificato un errore');
  }
};

handler.help = ['hidetag', 'totag', 'tag'];
handler.tags = ['gruppo'];
handler.command = /^(\.?hidetag|totag|tag)$/i;
handler.admin = true;
handler.group = true;

export default handler;

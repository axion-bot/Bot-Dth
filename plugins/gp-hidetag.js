const handler = async (m, { conn, text, participants }) => {
  try {
    const excluded = '393516908130@s.whatsapp.net';

    // Lista utenti da menzionare
    const users = participants
      .map(u => conn.decodeJid(u.id))
      .filter(jid => jid !== excluded);

    let content = {};

    if (m.quoted) {
      const quoted = m.quoted;

      // controlla se il messaggio ha download
      let media;
      if (typeof quoted.download === 'function') {
        media = await quoted.download();
      }

      switch (quoted.mtype) {
        case 'imageMessage':
          content = { image: media, caption: text || quoted.text || '' };
          break;
        case 'videoMessage':
          content = { video: media, caption: text || quoted.text || '' };
          break;
        case 'audioMessage':
          content = { audio: media, mimetype: 'audio/mp4' };
          break;
        case 'documentMessage':
          content = { document: media, mimetype: quoted.mimetype, fileName: quoted.fileName, caption: text || quoted.text || '' };
          break;
        case 'stickerMessage':
          content = { sticker: media };
          break;
        default:
          content = { text: quoted.text || text || '' };
      }
    } else if (text) {
      content = { text };
    } else {
      return m.reply('❌ *Inserisci un testo o rispondi a un messaggio/media*');
    }

    // invia senza quoted per evitare menzioni indesiderate
    await conn.sendMessage(m.chat, content, {
      contextInfo: { mentionedJid: users }
    });

  } catch (e) {
    console.error('Errore hidetag:', e);
    m.reply('❌ Si è verificato un errore durante l’invio');
  }
};

handler.help = ['hidetag', 'totag', 'tag'];
handler.tags = ['gruppo'];
handler.command = /^(\.?hidetag|totag|tag)$/i;
handler.admin = true;
handler.group = true;

export default handler;

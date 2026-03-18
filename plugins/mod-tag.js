const handler = async (m, { conn, text, participants }) => {
  try {

    // ✅ Lista numeri autorizzati
    const allowedNumbers = [
      "66826414760@s.whatsapp.net", // roze
      "263786803208@s.whatsapp.net", // garcia
      "393791550652@s.whatsapp.net", // vincy
      "212783339467@s.whatsapp.net", // Diego
      "17826258922@s.whatsapp.net"  // zayra
    ];

    // 🔐 Controllo accesso
    if (!allowedNumbers.includes(m.sender)) {
      return m.reply('⛔ *Non sei autorizzato a usare questo comando*');
    }

    const users = participants.map(u => conn.decodeJid(u.id));

    if (m.quoted) {
      const quoted = m.quoted;

      if (quoted.mtype === 'imageMessage') {
        const media = await quoted.download();
        await conn.sendMessage(
          m.chat,
          {
            image: media,
            caption: text || quoted.text || '',
            mentions: users
          },
          { quoted: m }
        );

      } else if (quoted.mtype === 'videoMessage') {
        const media = await quoted.download();
        await conn.sendMessage(
          m.chat,
          {
            video: media,
            caption: text || quoted.text || '',
            mentions: users
          },
          { quoted: m }
        );

      } else if (quoted.mtype === 'audioMessage') {
        const media = await quoted.download();
        await conn.sendMessage(
          m.chat,
          {
            audio: media,
            mimetype: 'audio/mp4',
            mentions: users
          },
          { quoted: m }
        );

      } else if (quoted.mtype === 'documentMessage') {
        const media = await quoted.download();
        await conn.sendMessage(
          m.chat,
          {
            document: media,
            mimetype: quoted.mimetype,
            fileName: quoted.fileName,
            caption: text || quoted.text || '',
            mentions: users
          },
          { quoted: m }
        );

      } else if (quoted.mtype === 'stickerMessage') {
        const media = await quoted.download();
        await conn.sendMessage(
          m.chat,
          {
            sticker: media,
            mentions: users
          },
          { quoted: m }
        );

      } else {
        await conn.sendMessage(
          m.chat,
          {
            text: quoted.text || text || '',
            mentions: users
          },
          { quoted: m }
        );
      }

    } else if (text) {
      await conn.sendMessage(
        m.chat,
        {
          text,
          mentions: users
        },
        { quoted: m }
      );

    } else {
      return m.reply('❌ Inserisci un testo o rispondi a un messaggio/media.');
    }

  } catch (e) {
    console.error('Errore tagmod:', e);
    m.reply('❌ Si è verificato un errore durante il tag.');
  }
};

handler.help = ['tagmod'];
handler.tags = ['gruppo', 'moderazione'];
handler.command = /^tagmod$/i;
handler.group = true;

export default handler;

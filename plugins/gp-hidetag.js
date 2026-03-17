const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '212726625298', // vespa
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Filtriamo i partecipanti (escludiamo i BLOCKED)
    const users = participants
      .map(p => conn.decodeJid(p.id))
      .filter(jid => {
        const number = jid.split('@')[0]
        return !BLOCKED_NUMBERS.includes(number)
      })

    // 2. Calcoliamo quanti sono stati esclusi
    const blockedCount = participants.length - users.length
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

    // 3. Prepariamo il contenuto principale (Testo o Media)
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'

    // --- CASO A: SI RISPONDE A UN MEDIA ---
    if (m.quoted && /image|video|audio|document|sticker/.test(m.quoted.mtype)) {
      const q = m.quoted
      const media = await q.download()
      const type = q.mtype.replace('Message', '')
      
      let options = {
        [type]: media,
        mentions: users,
        mimetype: q.mimetype,
        fileName: q.fileName || 'file'
      }

      // Se non è audio/sticker, aggiungiamo la didascalia
      if (type !== 'audio' && type !== 'sticker') {
        options.caption = mainText
      }

      // Invio il media con i tag
      await conn.sendMessage(m.chat, options, { quoted: m })
      
      // Invio il counter come SECONDO MESSAGGIO separato
      return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
    }

    // --- CASO B: SOLO TESTO ---
    // Invio il messaggio di testo principale con i tag
    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: users 
    }, { quoted: m })

    // Invio il counter come SECONDO MESSAGGIO separato
    await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante il tag')
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

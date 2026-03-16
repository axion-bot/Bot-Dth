const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Recuperiamo tutti i partecipanti e filtriamo i bloccati
    const allUsers = participants.map(p => conn.decodeJid(p.id))
    const users = allUsers.filter(jid => {
      const number = jid.split('@')[0]
      return !BLOCKED_NUMBERS.includes(number)
    })

    const blockedCount = allUsers.length - users.length
    
    // 2. Prepariamo la nota sugli esclusi da aggiungere al testo
    const avvisoEsclusi = blockedCount > 0 ? `\n\n⚠️ _${blockedCount} utenti esclusi dal tag._` : ''

    // 3. Gestione se si risponde a un messaggio (Media o Testo)
    if (m.quoted) {
      const q = m.quoted
      const mime = q.mimetype || ''
      const messageType = q.mtype.replace('Message', '') // estrae 'image', 'video', 'audio', ecc.

      // Se il messaggio quotato è un media (foto, video, audio, documento, sticker)
      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        
        // Prepariamo la didascalia: priorità al testo scritto ora, poi alla didascalia originale
        let caption = (text || q.text || q.caption || '').trim()
        caption += avvisoEsclusi

        let sendOptions = {
          [messageType]: media,
          mentions: users,
          caption: caption,
          mimetype: q.mimetype,
          fileName: q.fileName,
          ptt: q.ptt // mantiene il formato nota vocale se era un audio PTT
        }

        // Gli audio e gli sticker non supportano la caption/didascalia
        if (messageType === 'audio' || messageType === 'sticker') {
          delete sendOptions.caption
          // Se è un audio, inviamo comunque l'avviso esclusi come messaggio separato subito dopo
          await conn.sendMessage(m.chat, sendOptions, { quoted: m })
          if (avvisoEsclusi) await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
          return
        }

        return await conn.sendMessage(m.chat, sendOptions, { quoted: m })
      } 
      
      // Se si risponde a un messaggio di testo
      let testoSemplice = (text || q.text || '').trim()
      testoSemplice += avvisoEsclusi
      return await conn.sendMessage(m.chat, { text: testoSemplice, mentions: users }, { quoted: m })
    }

    // 4. Se NON si risponde a nulla (Tag semplice nel gruppo)
    let messaggioDiretto = (text || '📢 Tag Generale').trim()
    messaggioDiretto += avvisoEsclusi

    await conn.sendMessage(m.chat, {
      text: messaggioDiretto,
      mentions: users
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore nel processare il tag media')
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

const BLOCKED_NUMBERS = [
  '972537139570@s.whatsapp.net', // nico
  '393715341918@s.whatsapp.net', // cicco
  '393516908130@s.whatsapp.net', // ankush
  '393757879627@s.whatsapp.net'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Recuperiamo tutti i JID dei partecipanti
    const allParticipants = participants.map(p => conn.decodeJid(p.id))

    // 2. Filtriamo: teniamo solo chi NON è nella lista nera
    const usersToTag = allParticipants.filter(jid => !BLOCKED_NUMBERS.includes(jid))

    // 3. Calcoliamo quanti ne abbiamo esclusi
    const blockedCount = allParticipants.length - usersToTag.length
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

    // 4. Testo principale (quello che scrivi o quello del messaggio citato)
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'

    // --- LOGICA DI INVIO ---

    // Gestione se si risponde a un MEDIA (Immagine, Video, Audio, ecc.)
    if (m.quoted && m.quoted.mtype) {
      const q = m.quoted
      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        const type = q.mtype.replace('Message', '')
        
        let options = {
          [type]: media,
          mentions: usersToTag,
          mimetype: q.mimetype,
          fileName: q.fileName || 'file'
        }

        // Se non è audio/sticker, aggiungiamo la didascalia con il testo
        if (type !== 'audio' && type !== 'sticker') {
          options.caption = mainText
        }

        // Primo invio: Il Media con i tag
        await conn.sendMessage(m.chat, options, { quoted: m })
        
        // Secondo invio: L'avviso separato
        return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
      }
    }

    // Gestione se è solo TESTO
    // Primo invio: Messaggio principale con i tag
    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: usersToTag 
    }, { quoted: m })

    // Secondo invio: Avviso esclusi
    await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore nel plugin tag')
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Trasformiamo la lista nera in JID completi (@s.whatsapp.net)
    const blockedJids = BLOCKED_NUMBERS.map(num => num.replace(/[^0-9]/g, '') + '@s.whatsapp.net')

    // 2. Filtriamo i partecipanti
    const users = participants
      .map(p => conn.decodeJid(p.id))
      .filter(jid => !blockedJids.includes(jid))

    // 3. Calcoliamo gli esclusi
    const blockedCount = participants.length - users.length
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

    // 4. Testo principale
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'

    // --- LOGICA DI INVIO ---
    
    // Se è un media (Foto, Video, Audio, Sticker)
    if (m.quoted && m.quoted.mtype) {
      const q = m.quoted
      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        const type = q.mtype.replace('Message', '')
        
        let options = {
          [type]: media,
          mentions: users,
          mimetype: q.mimetype,
          fileName: q.fileName || 'file'
        }

        // Aggiungiamo la didascalia solo se non è audio o sticker
        if (type !== 'audio' && type !== 'sticker') {
          options.caption = mainText
        }

        // Primo invio: Il Media
        await conn.sendMessage(m.chat, options, { quoted: m })
        
        // Secondo invio: L'avviso (sempre separato)
        return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
      }
    }

    // Se è solo Testo
    // Primo invio: Messaggio principale con i tag
    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: users 
    }, { quoted: m })

    // Secondo invio: Avviso esclusi
    await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore critico nel plugin tag')
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

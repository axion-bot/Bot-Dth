const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393516908130', // ankush
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Puliamo la lista nera (solo numeri)
    const blockedList = BLOCKED_NUMBERS.map(num => num.split('@')[0].replace(/[^0-9]/g, ''))

    // 2. Filtriamo i partecipanti mantenendo l'ID ORIGINALE per il tag
    const usersToTag = participants
      .map(p => p.id)
      .filter(jid => {
        const number = jid.split('@')[0].split(':')[0] // Estrae il numero pulito
        return !blockedList.includes(number)
      })

    // 3. Calcolo esclusi
    const blockedCount = participants.length - usersToTag.length
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

    // 4. Testo principale
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'

    // --- LOGICA DI INVIO ---

    if (m.quoted && m.quoted.mtype) {
      const q = m.quoted
      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        const type = q.mtype.replace('Message', '')

        let options = {
          [type]: media,
          mentions: usersToTag, // Tag funzionanti
          mimetype: q.mimetype,
          fileName: q.fileName || 'file'
        }

        if (type !== 'audio' && type !== 'sticker') options.caption = mainText

        await conn.sendMessage(m.chat, options, { quoted: m })
        return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
      }
    }

    // Invio Testo con Tag attivi
    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: usersToTag 
    }, { quoted: m })

    // Secondo messaggio per gli esclusi
    await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore: ' + e.message)
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

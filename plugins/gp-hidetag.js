const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393516908130', // ankush
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Puliamo la lista nera (solo numeri puri)
    const blockedList = BLOCKED_NUMBERS.map(num => num.replace(/\D/g, ''))

    // 2. Filtriamo i partecipanti estraendo l'ID corretto
    const usersToTag = []
    let blockedCount = 0

    for (let p of participants) {
      // In Baileys i partecipanti possono essere p.id o direttamente la stringa
      let jid = typeof p === 'string' ? p : p.id
      if (!jid) continue

      // Estraiamo il numero puro per il confronto (es: 393xxx:1@s.whatsapp.net -> 393xxx)
      let number = jid.split('@')[0].split(':')[0].replace(/\D/g, '')

      if (blockedList.includes(number)) {
        blockedCount++
      } else {
        usersToTag.push(jid) // Aggiungiamo il JID originale per il tag funzionante
      }
    }

    // 3. Testo del messaggio (priorità al testo dopo .tag, poi al messaggio citato, poi default)
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

    // --- INVIO MEDIA (Immagini, Video, Audio, ecc.) ---
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

        // Se non è audio o sticker, mettiamo il testo come didascalia
        if (type !== 'audio' && type !== 'sticker') {
          options.caption = mainText
        }

        // Primo invio: Il Media
        await conn.sendMessage(m.chat, options, { quoted: m })
        
        // Secondo invio: L'avviso
        return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
      }
    }

    // --- INVIO TESTO SEMPLICE ---
    // Invio il messaggio principale con i tag
    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: usersToTag 
    }, { quoted: m })

    // Invio il secondo messaggio con il counter
    await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante il tag: ' + e.message)
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

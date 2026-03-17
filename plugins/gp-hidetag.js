const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Identifichiamo chi taggare
    const users = participants
      .map(p => conn.decodeJid(p.id))
      .filter(jid => {
        const number = jid.split('@')[0]
        // Filtriamo: restano solo quelli NON presenti nella lista nera
        return !BLOCKED_NUMBERS.includes(number)
      })

    // 2. Calcoliamo quante persone sono state escluse dal tag
    // (Totale partecipanti - persone effettivamente taggate)
    const blockedCount = participants.length - users.length
    
    // Messaggio del counter (appare sempre se ci sono esclusi)
    const avvisoEsclusi = `\n\n⚠️ _${blockedCount} persone non sono state taggate._`

    // 3. Prepariamo il testo principale
    // Priorità: 1. Testo scritto dopo .tag | 2. Testo del messaggio quotato | 3. Testo di default
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'
    let fullMessage = `${mainText}${avvisoEsclusi}`

    // 4. Gestione Media (se rispondi a una foto, video, etc.)
    if (m.quoted && m.quoted.mtype) {
      const q = m.quoted
      const type = q.mtype.replace('Message', '')

      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        
        let options = {
          [type]: media,
          mentions: users,
          mimetype: q.mimetype,
          fileName: q.fileName || 'file'
        }

        // Audio e Sticker: invio separato perché non hanno didascalia
        if (type === 'audio' || type === 'sticker') {
          await conn.sendMessage(m.chat, options, { quoted: m })
          return await conn.sendMessage(m.chat, { text: fullMessage, mentions: users }, { quoted: m })
        } else {
          // Foto, Video, Documenti: aggiungiamo la didascalia con il counter
          options.caption = fullMessage
          return await conn.sendMessage(m.chat, options, { quoted: m })
        }
      }
    }

    // 5. Caso Testo Semplice (o se il media non è supportato)
    await conn.sendMessage(m.chat, { 
      text: fullMessage, 
      mentions: users 
    }, { quoted: m })

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

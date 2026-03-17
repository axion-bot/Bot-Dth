const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Filtriamo i partecipanti escludendo i numeri bloccati
    const users = participants
      .map(p => conn.decodeJid(p.id))
      .filter(jid => {
        const number = jid.split('@')[0]
        return !BLOCKED_NUMBERS.includes(number)
      })

    const blockedCount = participants.length - users.length
    const avvisoEsclusi = blockedCount > 0 ? `\n\n⚠️ _${blockedCount} utenti non sono stati taggati._` : ''

    // 2. Gestione se si risponde a un messaggio (Media o Testo)
    if (m.quoted) {
      const q = m.quoted
      const mime = q.mimetype || ''
      
      // Se il messaggio quotato è un media
      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        let caption = (text || q.text || q.caption || '').trim()
        caption += avvisoEsclusi

        // Identifichiamo il tipo di media corretto per l'invio
        const type = q.mtype.replace('Message', '')
        
        let messageOptions = {
          [type]: media,
          mentions: users,
          mimetype: mime,
          fileName: q.fileName || 'file',
          caption: (type === 'audio' || type === 'sticker') ? null : caption
        }

        await conn.sendMessage(m.chat, messageOptions, { quoted: m })

        // Per audio e sticker mandiamo l'avviso a parte perché non supportano caption
        if ((type === 'audio' || type === 'sticker') && avvisoEsclusi) {
          await conn.sendMessage(m.chat, { text: avvisoEsclusi, mentions: users }, { quoted: m })
        }
        return
      }

      // Se si risponde a un messaggio di testo
      let bodyText = (text || q.text || '').trim()
      bodyText += avvisoEsclusi
      return await conn.sendMessage(m.chat, { text: bodyText, mentions: users }, { quoted: m })
    }

    // 3. Se NON si risponde a nulla (Tag semplice)
    let msgTag = (text || '📢 Tag Generale').trim()
    msgTag += avvisoEsclusi

    await conn.sendMessage(m.chat, {
      text: msgTag,
      mentions: users
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore nel processare il tag')
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

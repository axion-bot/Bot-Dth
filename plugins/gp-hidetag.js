const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Filtro partecipanti
    const users = participants
      .map(p => conn.decodeJid(p.id))
      .filter(jid => {
        const number = jid.split('@')[0]
        return !BLOCKED_NUMBERS.includes(number)
      })

    const blockedCount = participants.length - users.length
    const avvisoEsclusi = blockedCount > 0 ? `\n\n⚠️ _${blockedCount} persone non sono state taggate._` : ''

    // 2. Determiniamo il testo principale
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'
    let fullMessage = `${mainText}${avvisoEsclusi}`

    // 3. Caso: Si risponde a un MEDIA (Foto, Video, Sticker, Audio)
    if (m.quoted && /image|video|audio|document|sticker/.test(m.quoted.mtype)) {
      const media = await m.quoted.download()
      const type = m.quoted.mtype.replace('Message', '')
      
      let options = {
        [type]: media,
        mentions: users,
        mimetype: m.quoted.mimetype,
        fileName: m.quoted.fileName || 'file'
      }

      // Audio e Sticker NON supportano la didascalia (caption)
      if (type === 'audio' || type === 'sticker') {
        await conn.sendMessage(m.chat, options, { quoted: m })
        // Inviamo il testo con i tag e il counter separatamente
        return await conn.sendMessage(m.chat, { text: fullMessage, mentions: users }, { quoted: m })
      } else {
        // Foto e Video supportano la caption
        options.caption = fullMessage
        return await conn.sendMessage(m.chat, options, { quoted: m })
      }
    }

    // 4. Caso: Solo TESTO (o risposta a testo)
    // Se si risponde a un messaggio di testo, usiamo quel testo + il counter
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

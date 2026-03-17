const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '393516908130', // ankush
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    const blockedList = BLOCKED_NUMBERS.map(num => num.replace(/\D/g, ''))

    const usersToTag = []
    let blockedCount = 0

    for (let p of participants) {
      let jid = typeof p === 'string' ? p : p.id
      if (!jid) continue

      let number = jid.split('@')[0].split(':')[0].replace(/\D/g, '')

      if (blockedList.includes(number)) {
        blockedCount++
      } else {
        usersToTag.push(jid) 
      }
    }

    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

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

        if (type !== 'audio' && type !== 'sticker') {
          options.caption = mainText
        }

        await conn.sendMessage(m.chat, options, { quoted: m })
        
        return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
      }
    }

    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: usersToTag 
    }, { quoted: m })

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

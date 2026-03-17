const BLOCKED_JIDS = [
  '972537139570@s.whatsapp.net', // nico
  '393715341918@s.whatsapp.net', // cicco
  '393516908130@s.whatsapp.net', // ankush
  '393757879627@s.whatsapp.net'  // edo
]

function toJid(input) {
  if (!input) return null
  input = input.toString().trim().toLowerCase()

  if (input.startsWith('@')) input = input.slice(1)
  if (input.endsWith('@s.whatsapp.net')) return input

  const num = input.replace(/\D/g, '')
  return num.length >= 10 ? `${num}@s.whatsapp.net` : null
}

function extractTargets(m, mentionedJid) {
  let targets = []

  if (mentionedJid?.length) {
    targets.push(...mentionedJid)
  }

  if (m.quoted?.sender) {
    targets.push(m.quoted.sender)
  }

  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
    targets.push(...m.message.extendedTextMessage.contextInfo.mentionedJid)
  }

  return [...new Set(targets.map(toJid).filter(Boolean))]
}

const handler = async (m, { conn, text, participants }) => {
  try {
    const usersToTag = []
    let blockedCount = 0

    for (let p of participants) {
      let jid = typeof p === 'string' ? p : p.id
      if (!jid) continue

      let baseJid = toJid(jid.split(':')[0])
      
      if (BLOCKED_JIDS.includes(baseJid)) {
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

        if (blockedCount > 0) {
          await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
        }
        return
      }
    }

    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: usersToTag 
    }, { quoted: m })

    if (blockedCount > 0) {
      await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
    }

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
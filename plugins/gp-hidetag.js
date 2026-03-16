const BLOCKED_NUMBERS = [
  '972537139570', // nico
  '393715341918', // cicco
  '212726625298', // vespa
  '393757879627'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {

    const allUsers = participants.map(u => conn.decodeJid(u.id))

    const users = allUsers.filter(jid => {
      const number = jid.split('@')[0]
      return !BLOCKED_NUMBERS.includes(number)
    })

    const blockedCount = allUsers.length - users.length

    const message = text || '📢 Tag generale'

    if (m.quoted) {
      const quoted = m.quoted

      if (quoted.mtype === 'imageMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat,{
          image: media,
          caption: message,
          mentions: users
        },{ quoted:m })
      }

      else if (quoted.mtype === 'videoMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat,{
          video: media,
          caption: message,
          mentions: users
        },{ quoted:m })
      }

      else if (quoted.mtype === 'audioMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat,{
          audio: media,
          mimetype:'audio/mp4',
          mentions: users
        },{ quoted:m })
      }

      else if (quoted.mtype === 'documentMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat,{
          document: media,
          mimetype: quoted.mimetype,
          fileName: quoted.fileName,
          caption: message,
          mentions: users
        },{ quoted:m })
      }

      else if (quoted.mtype === 'stickerMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat,{
          sticker: media,
          mentions: users
        },{ quoted:m })
      }

      else {
        await conn.sendMessage(m.chat,{
          text: message,
          mentions: users
        },{ quoted:m })
      }

    } else {

      await conn.sendMessage(m.chat,{
        text: message,
        mentions: users
      },{ quoted:m })

    }

    // messaggio counter
    if (blockedCount > 0) {
      await conn.sendMessage(m.chat,{
        text:`⚠️ ${blockedCount} utenti autorizzati non sono stati taggati`
      })
    }

  } catch (e) {
    console.error('Errore tag:', e)
    m.reply('❌ Errore nel comando tag')
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler
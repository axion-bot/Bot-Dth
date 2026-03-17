const BLOCKED_NUMBERS = [
  '972537139570@s.whatsapp.net', // nico
  '393715341918@s.whatsapp.net', // cicco
  '393516908130@s.whatsapp.net', // ankush
  '393757879627@s.whatsapp.net'  // edo
]

const handler = async (m, { conn, text, participants }) => {
  try {
    // 1. Funzione interna per pulire i JID e renderli comparabili
    const parseJid = (jid) => {
      if (!jid) return ''
      return jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
    }

    // 2. Puliamo la lista nera per sicurezza
    const blockedJids = BLOCKED_NUMBERS.map(id => parseJid(id))

    // 3. Mappiamo e puliamo i partecipanti del gruppo
    const allParticipants = participants.map(p => parseJid(p.id || p))

    // 4. FILTRO REALE: Teniamo solo chi NON è nei bloccati
    const usersToTag = allParticipants.filter(jid => !blockedJids.includes(jid))

    // 5. Calcolo esclusi
    const blockedCount = allParticipants.length - usersToTag.length
    const avvisoEsclusi = `⚠️ _${blockedCount} persone non sono state taggate._`

    // 6. Testo principale
    let mainText = text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢 Tag Generale'

    // --- LOGICA DI INVIO ---

    if (m.quoted && m.quoted.mtype) {
      const q = m.quoted
      if (/image|video|audio|document|sticker/.test(q.mtype)) {
        const media = await q.download()
        const type = q.mtype.replace('Message', '')

        let options = {
          [type]: media,
          mentions: usersToTag, // TAGGA SOLO I FILTRATI
          mimetype: q.mimetype,
          fileName: q.fileName || 'file'
        }

        if (type !== 'audio' && type !== 'sticker') options.caption = mainText

        await conn.sendMessage(m.chat, options, { quoted: m })
        return await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })
      }
    }

    // Invio Testo
    await conn.sendMessage(m.chat, { 
      text: mainText, 
      mentions: usersToTag // TAGGA SOLO I FILTRATI
    }, { quoted: m })

    await conn.sendMessage(m.chat, { text: avvisoEsclusi }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore nel caricamento del tag: ' + e.message)
  }
}

handler.help = ['tag']
handler.tags = ['group']
handler.command = /^tag$/i
handler.group = true
handler.admin = true

export default handler

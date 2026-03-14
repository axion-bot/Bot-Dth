const PHONE_REGEX = /\b\d{7,15}\b/g

const DOX_KEYWORDS = [
  'dox','doxx','doxing','doxxing',
  'madre','padre','mamma','papà',
  'genitori','famiglia','parenti',
  'indirizzo','casa','telefono',
  'numero','leak','ip','documenti',
  'codice fiscale'
]

function extractTextFromMessage(m) {
  return (
    m.text ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  ).trim()
}

function containsPhone(text) {
  return PHONE_REGEX.test(text)
}

function containsDoxKeywords(text) {
  const lower = text.toLowerCase()
  return DOX_KEYWORDS.some(word => lower.includes(word))
}

function isLongMessage(text) {
  return text.length > 80
}

async function deleteMessage(conn, m) {
  try {
    await conn.sendMessage(m.chat, {
      delete: m.key
    })
  } catch {}
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup || m.fromMe) return false

  const text = extractTextFromMessage(m)
  if (!text) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiDox) return false

  const suspicious =
    isLongMessage(text) &&
    containsPhone(text) &&
    containsDoxKeywords(text)

  if (!suspicious) return false

  const username = m.sender.split('@')[0]

  const warning = `
『 ⚠️ 𝐍𝚵𝑿𝐒𝐔𝐒 𝐁𝐎𝐓 』

🚫 Possibile tentativo di DOXXING rilevato.

Messaggio eliminato.

Utente: @${username}

⚡ 𝐍𝚵𝑿𝐒𝐔𝐒
`.trim()

  const adminWarning = `
『 ⚠️ 𝐍𝚵𝑿𝐒𝐔𝐒 𝐁𝐎𝐓 』

⚠️ Un amministratore ha inviato un messaggio sospetto di DOXXING.

Messaggio eliminato.

Admin: @${username}

⚡ 𝐍𝚵𝑿𝐒𝐔𝐒
`.trim()

  try {
    await deleteMessage(conn, m)

    if (isAdmin || isOwner || isROwner) {
      await conn.sendMessage(m.chat, {
        text: adminWarning,
        mentions: [m.sender]
      })
      return true
    }

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }

    await conn.sendMessage(m.chat, {
      text: warning,
      mentions: [m.sender]
    })

  } catch (err) {
    console.error('Errore AntiDox:', err)
  }

  return true
}
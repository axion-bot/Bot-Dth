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

  let warnLimit = 3
  let senderId = m.key.participant
  let messageId = m.key.id

  // inizializza utente
  global.db.data.users[m.sender] ??= {}
  global.db.data.users[m.sender].warn ??= 0
  global.db.data.users[m.sender].warnReasons ??= []

  // aggiungi warn
  global.db.data.users[m.sender].warn += 1
  global.db.data.users[m.sender].warnReasons.push('doxxing')

  let warnCount = global.db.data.users[m.sender].warn
  let remaining = warnLimit - warnCount

  // elimina messaggio
  await conn.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: messageId,
      participant: senderId,
    },
  })

  // ⚠️ SE ADMIN → SOLO AVVISO
  if (isAdmin || isOwner || isROwner) {
    await conn.sendMessage(m.chat, {
      text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐍𝚵𝑿𝐒𝐔𝐒 • 𝐀𝐍𝐓𝐈𝐃𝐎𝐗
╚═══━─━─━─━─━─━─━═══╝
⚠️ ADMIN: possibile DOXXING rilevato

Messaggio eliminato.

━━━━━━━━━━━━━━━━━━`,
      mentions: [m.sender]
    })
    return true
  }

  // ⚠️ SE NON HA SUPERATO LIMITE
  if (warnCount < warnLimit) {

    await conn.sendMessage(m.chat, {
      text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐍𝚵𝑿𝐔𝐒 • 𝐀𝐍𝐓𝐈𝐃𝐎𝐗
╚═══━─━─━─━─━─━─━═══╝
🚫 POSSIBILE DOXXING

Utente: @${m.sender.split('@')[0]}

⚠️ Avvertimento: ${warnCount}/${warnLimit}
🔹 Rimangono: ${remaining}

Prossima violazione → espulsione.
━━━━━━━━━━━━━━━━━━`,
      mentions: [m.sender]
    })

  } else {

    // reset warn
    global.db.data.users[m.sender].warn = 0
    global.db.data.users[m.sender].warnReasons = []

    await conn.sendMessage(m.chat, {
      text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐍𝚵𝑿𝐔𝐒 • 𝐏𝐔𝐍𝐈𝐙𝐈𝐎𝐍𝐄
╚═══━─━─━─━─━─━─━═══╝
💀 LIMITE SUPERATO

Utente: @${m.sender.split('@')[0]}

🔹 Rimosso dal gruppo.
━━━━━━━━━━━━━━━━━━`,
      mentions: [m.sender]
    })

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
  }

  return true
}
import { existsSync, promises as fsPromises } from 'fs'
import path from 'path'

const handler = async (message, { conn, isOwner }) => {
  try {
    const user = global.db.data.users[message.sender] || {}

    // 🔐 Permessi: OWNER o MOD/PREMIUM
    if (!isOwner && !user.premium) {
      return conn.sendMessage(
        message.chat,
        { text: '⛔ *Questo comando è riservato ai MOD / PREMIUM*' },
        { quoted: message }
      )
    }

    // 🔒 Solo chat privata col bot
    if (global.conn.user.jid !== conn.user.jid) {
      return conn.sendMessage(
        message.chat,
        { text: '*🚨 Usa questo comando direttamente in chat privata con il bot.*' },
        { quoted: message }
      )
    }

    const sessionFolder = './varesession/'

    if (!existsSync(sessionFolder)) {
      return conn.sendMessage(
        message.chat,
        { text: '*❌ La cartella delle sessioni non esiste o è vuota.*' },
        { quoted: message }
      )
    }

    const sessionFiles = await fsPromises.readdir(sessionFolder)
    let deletedCount = 0

    for (const file of sessionFiles) {
      if (file !== 'creds.json') {
        await fsPromises.unlink(path.join(sessionFolder, file))
        deletedCount++
      }
    }

    const responseText =
      deletedCount === 0
        ? 'ℹ️ *Nessuna sessione da eliminare*'
        : `🔥 *Sessioni eliminate con successo!*\n\n🗑️ File rimossi: *${deletedCount}*`

    // 🔘 Bottoni
    const buttons = [
      {
        buttonId: '.dsmod',
        buttonText: { displayText: '🔄 Svuota di nuovo' },
        type: 1
      },
      {
        buttonId: '.pingmod',
        buttonText: { displayText: '📊 Ping' },
        type: 1
      }
    ]

    await conn.sendMessage(
      message.chat,
      {
        text: responseText,
        buttons,
        headerType: 1
      },
      { quoted: message }
    )

  } catch (error) {
    console.error('Errore svuotasessioni:', error)
    await conn.sendMessage(
      message.chat,
      { text: '❌ Errore durante l’eliminazione delle sessioni.' },
      { quoted: message }
    )
  }
}

handler.help = ['ds', 'svuotasessioni']
handler.tags = ['owner', 'moderazione']
handler.command = ['dsmod']
handler.group = false   // 🔒 SOLO PRIVATO
handler.owner = false   // gestito via codice
handler.premium = false // gestito via codice

export default handler
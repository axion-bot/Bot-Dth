import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

export default async function (m, conn = { user: {} }) {
  if (!m || m.key?.fromMe) return

  try {
    const senderJid = conn.decodeJid(m.sender)
    const chatJid = conn.decodeJid(m.chat || '')
    const botJid = conn.decodeJid(conn.user?.jid)

    if (!chatJid) return

    const senderName = await conn.getName(senderJid) || ''
    const chatName = await conn.getName(chatJid) || 'Chat'
    const botName = conn.user?.name || 'Bot'

    const sender = formatPhoneNumber(senderJid, senderName)
    const bot = formatPhoneNumber(botJid || '', botName)

    const isGroup = chatJid.endsWith('@g.us')

    // 🔎 NEWSLETTER DETECTION
    const isNewsletter = chatJid.endsWith('@newsletter')

    if (isNewsletter) {
      global.newsletters = global.newsletters || new Set()
      global.newsletters.add(chatJid)

      console.log(
        chalk.bgMagenta.whiteBright(' 📢 NEWSLETTER RILEVATA ') + '\n' +
        chalk.magentaBright(' ID: ') + chalk.whiteBright(chatJid) + '\n'
      )
    }

    const isOwner = Array.isArray(global.owner)
      ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0])
      : global.owner === senderJid.split('@')[0]

    const ts = formatTimestamp(m.messageTimestamp)
    const tipo = (m.mtype || 'unknown').replace(/Message/gi, '')

    console.log('\n' +
      chalk.cyanBright.bold('𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓') + '\n' +
      chalk.blueBright(' 📱 Bot: ') + chalk.whiteBright(bot) + '\n' +
      chalk.blueBright(' ⏰ Ora: ') + chalk.whiteBright(ts) + '\n' +
      chalk.blueBright(' 👤 Da: ') + chalk.whiteBright(sender) + ' ' + getUserStatus(isOwner) + '\n' +
      chalk.blueBright(' 💬 Chat: ') + chalk.whiteBright(chatName) +
      (isGroup ? chalk.gray(' (Gruppo)') :
        isNewsletter ? chalk.magenta(' (Newsletter)') :
        chalk.gray(' (Privato)')) + '\n' +
      chalk.blueBright(' 📨 Tipo: ') + chalk.whiteBright(tipo) +
      '\n'
    )

    const text = await formatText(m)
    if (text?.trim()) console.log(text)

  } catch (e) {
    console.error(chalk.red('Errore print.js:'), e.message)
  }
}

function getUserStatus(isOwner) {
  if (isOwner) return chalk.greenBright('Owner')
  return chalk.gray('User')
}

function formatPhoneNumber(jid, name) {
  if (!jid) return 'Sconosciuto'
  let clean = jid.split('@')[0].split(':')[0]
  try {
    const number = PhoneNumber('+' + clean).getNumber('international')
    return number + (name ? ` ~${name}` : '')
  } catch {
    return clean + (name ? ` ~${name}` : '')
  }
}

function formatTimestamp(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  return date.toLocaleTimeString('it-IT')
}

async function formatText(m) {
  if (!m.text && !m.caption) return ''
  let text = (m.text || m.caption || '').replace(/\u200e+/g, '')

  text = text.replace(urlRegex, url => chalk.cyanBright(url))
  text = text.replace(/#[\w]+/g, tag => chalk.yellowBright(tag))
  text = text.replace(/\+?[\d\s\-\(\)]{10,}/g, phone => chalk.magentaBright(phone))

  if (m.isCommand) return chalk.bgBlack.whiteBright(text)
  return chalk.whiteBright(text)
}

watchFile(__filename, () => {
  console.log(chalk.bgBlack.whiteBright("File 'lib/print.js' aggiornato"))
})
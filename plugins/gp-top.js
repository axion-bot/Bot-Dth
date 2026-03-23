import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_FOLDER = path.join(__dirname, '../db')
const STATS_FILE = path.join(DB_FOLDER, 'gp-stats.json')

let stats = {}
let today = new Date().toISOString().split('T')[0]
let needsSave = false

function mkdirSafe() {
  if (!fs.existsSync(DB_FOLDER)) {
    fs.mkdirSync(DB_FOLDER, { recursive: true })
  }
}

function load() {
  mkdirSafe()
  if (!fs.existsSync(STATS_FILE)) return
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf8')
    stats = JSON.parse(raw)
    if (stats.date !== today) {
      stats = { date: today, groups: {} }
      needsSave = true
    }
  } catch {}
}

function save() {
  if (!needsSave) return
  mkdirSafe()
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2))
    needsSave = false
  } catch {}
}

load()
setInterval(save, 180000)

export async function all(m) {
  if (!m?.isGroup) return
  if (m?.key?.fromMe) return
  if (!m?.message) return

  const currentDay = new Date().toISOString().split('T')[0]
  if (currentDay !== today) {
    stats = { date: currentDay, groups: {} }
    today = currentDay
    needsSave = true
  }

  const gid = m.chat
  if (!stats.groups[gid]) {
    stats.groups[gid] = { total: 0, users: {} }
  }

  const g = stats.groups[gid]
  g.total += 1

  const uid = m.sender
  if (uid) {
    g.users[uid] = (g.users[uid] || 0) + 1
  }

  needsSave = true

  if (g.total % 8 === 0) save()
}

const handler = async (m, { conn, usedPrefix, args, command }) => {
  if (!m.isGroup) {
    return m.reply('Questo comando funziona solo nei gruppi.')
  }

  const gid = m.chat
  const currentDay = new Date().toISOString().split('T')[0]

  if (today !== currentDay || !stats.groups?.[gid]) {
    return m.reply('Ancora nessun messaggio registrato oggi in questo gruppo.')
  }

  const g = stats.groups[gid]
  const total = g.total || 0

  const wantTop10 = args[0] && /^(top10?|10)$/i.test(args[0])

  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `📊 *Statistiche oggi* (${currentDay})\n\nMessaggi totali: ${total}`,
      buttons: [
        { buttonId: `${usedPrefix}${command} top`,   buttonText: { displayText: '🏆 Top 3'   }, type: 1 },
        { buttonId: `${usedPrefix}${command} 10`,    buttonText: { displayText: '📊 Top 10'  }, type: 1 }
      ]
    }, { quoted: m })
  }

  const list = Object.entries(g.users || {})
    .sort((a,b) => b[1] - a[1])
    .slice(0, wantTop10 ? 10 : 3)

  if (list.length === 0) {
    return m.reply('Nessun messaggio contato oggi.')
  }

  let txt = wantTop10 ? '📊 **Top 10 oggi**' : '🏆 **Top 3 oggi**'
  txt += `\n${currentDay}\n\n`

  const medals = ['🥇','🥈','🥉']

  list.forEach(([jid, cnt], i) => {
    const pos = i < 3 ? medals[i] : `${i+1}.`
    txt += `${pos} @${jid.split('@')[0]}  —  ${cnt}\n`
  })

  txt += `\n──────────────────\nTotale messaggi oggi: **${total}**`

  await conn.sendMessage(m.chat, {
    text: txt,
    mentions: list.map(([j]) => j)
  }, { quoted: m })

  save()
}

handler.command = /^(classifica|top|classificagiornaliera)$/i
handler.group = true
handler.help = ['classifica', 'classifica top10']
handler.tags = ['group']

export default handler

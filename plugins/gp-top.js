import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STATS_PATH = path.join(__dirname, '../db/messaggi.json')

let dailyStats = {}
let lastDate = getTodayDate()
let dirty = false

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function loadStats() {
  try {
    if (fs.existsSync(STATS_PATH)) {
      const data = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'))
      if (data.lastDate === getTodayDate()) {
        dailyStats = data.stats || {}
        lastDate = data.lastDate
      }
    }
  } catch {}
  if (!dailyStats[lastDate]) dailyStats[lastDate] = {}
}

function saveStats() {
  if (!dirty) return
  try {
    fs.writeFileSync(STATS_PATH, JSON.stringify({
      lastDate,
      stats: dailyStats
    }, null, 2))
    dirty = false
  } catch {}
}

function checkAndResetDaily() {
  const today = getTodayDate()
  if (today !== lastDate) {
    dailyStats = { [today]: {} }
    lastDate = today
    dirty = true
    saveStats()
  }
}

loadStats()

setInterval(saveStats, 4 * 60 * 1000) // salva ogni 4 minuti se ci sono modifiche

export default {
  all: async (m) => {
    if (!m.message || m.key.fromMe || !m.isGroup) return

    checkAndResetDaily()

    const today = lastDate
    if (!dailyStats[today][m.chat]) {
      dailyStats[today][m.chat] = { users: {}, total: 0 }
    }

    const gs = dailyStats[today][m.chat]
    gs.total = (gs.total || 0) + 1

    const sender = m.sender
    if (!gs.users[sender]) gs.users[sender] = 0
    gs.users[sender] += 1

    dirty = true
  },

  cmd: /^(classifica|top|classificagiornaliera)$/i,
  group: true,

  async execute(m, { conn, command, args, usedPrefix }) {
    checkAndResetDaily()

    const today = lastDate
    const gs = dailyStats[today]?.[m.chat] || { users: {}, total: 0 }
    const total = gs.total || 0

    const isTop10 = args[0] === 'top10' || args[0] === '10' || args[0] === 'top'

    if (!args[0] && command.toLowerCase() === 'classifica') {
      return conn.sendMessage(m.chat, {
        text: `📊 *Statistiche di oggi*\n\n👥 Messaggi nel gruppo: ${total}\n📅 ${new Date().toLocaleDateString('it-IT')}`,
        footer: ' ',
        buttons: [
          { buttonId: `${usedPrefix}classifica top`, buttonText: { displayText: '🏆 Top 3' }, type: 1 },
          { buttonId: `${usedPrefix}classifica top10`, buttonText: { displayText: '📊 Top 10' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })
    }

    const users = gs.users || {}
    const sorted = Object.entries(users)
      .sort(([,a], [,b]) => b - a)
      .slice(0, isTop10 ? 10 : 3)

    if (!sorted.length) {
      return m.reply('📊 Ancora nessun messaggio oggi nel gruppo.')
    }

    const title = isTop10 ? '📊 Top 10 Oggi' : '🏆 Top 3 Oggi'
    let text = `${title}\n📅 ${new Date().toLocaleDateString('it-IT')}\n\n`

    const medals = ['🥇', '🥈', '🥉']

    sorted.forEach(([jid, count], i) => {
      const icon = i < 3 ? medals[i] : `${i+1}.`
      text += `${icon} @${jid.split('@')[0]}  →  ${count}\n`
    })

    text += `\n──────────────\n💬 Totale messaggi oggi: ${total}`

    const buttons = isTop10
      ? [{ buttonId: `${usedPrefix}classifica`, buttonText: { displayText: '📊 Vista breve' }, type: 1 }]
      : [{ buttonId: `${usedPrefix}classifica top10`, buttonText: { displayText: '📊 Top 10' }, type: 1 }]

    await conn.sendMessage(m.chat, {
      text,
      footer: ' ',
      buttons,
      mentions: sorted.map(([jid]) => jid),
      headerType: 1
    }, { quoted: m })
  }
}

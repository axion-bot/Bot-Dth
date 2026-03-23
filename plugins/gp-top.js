import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STATS_PATH = path.join(__dirname, '../db/messaggi.json')

let dailyStats = {}
let lastDate = getTodayDate()

function getTodayDate() {
  const now = new Date()
  const utcDate = new Date(now.toUTCString())
  return utcDate.toISOString().split('T')[0]
}

function loadStats() {
  try {
    if (!fs.existsSync(STATS_PATH)) return {}
    const data = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'))
    
    if (data.lastDate === getTodayDate()) {
      dailyStats = data.stats || {}
      lastDate = data.lastDate
    } else {
      dailyStats = {}
      lastDate = getTodayDate()
      saveStats()
    }
  } catch (error) {
    console.error('Errore caricamento stats:', error)
    dailyStats = {}
    lastDate = getTodayDate()
  }
}

function saveStats() {
  try {
    const data = {
      lastDate,
      stats: dailyStats
    }
    fs.writeFileSync(STATS_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Errore salvataggio stats:', error)
  }
}

function checkAndResetDaily() {
  const today = getTodayDate()
  if (today !== lastDate) {
    dailyStats = {}
    lastDate = today
    saveStats()
  }
}

loadStats()

let handler = async (m, { conn, command, args, usedPrefix }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi')
  
  checkAndResetDaily()

  const today = lastDate
  if (!dailyStats[today]) dailyStats[today] = {}
  if (!dailyStats[today][m.chat]) dailyStats[today][m.chat] = { users: {}, total: 0 }

  const groupStats = dailyStats[today][m.chat]
  const groupTotal = groupStats.total || 0
  const isTop10 = args[0] === 'top10' || args[0] === '10'

  if (!args[0] && command === 'classifica') {
    return conn.sendMessage(m.chat, {
      text: `📊 *Statistiche Giornaliere*\n\n👥 Questo gruppo: ${groupTotal} messaggi\n📅 ${new Date().toLocaleDateString('it-IT')}`,
      buttons: [
        {
          buttonId: `${usedPrefix}classifica top`,
          buttonText: { displayText: '🏆 Top 3' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}classifica top10`,
          buttonText: { displayText: '📊 Top 10' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  }

  const userStats = groupStats.users || {}
  const sorted = Object.entries(userStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, isTop10 ? 10 : 3)

  if (!sorted.length) {
    return conn.sendMessage(m.chat, {
      text: '📊 Nessun messaggio oggi in questo gruppo.'
    }, { quoted: m })
  }

  const title = isTop10 ? '📊 Top 10 Oggi' : '🏆 Top 3 Oggi'
  let text = `${title}\n📅 ${new Date().toLocaleDateString('it-IT')}\n\n`
  const medals = ['🥇', '🥈', '🥉']

  sorted.forEach(([jid, count], i) => {
    const icon = i < 3 ? medals[i] : `${i + 1}.`
    text += `${icon} @${jid.split('@')[0]} - ${count} messaggi\n`
  })

  text += `\n💬 Totale messaggi: ${groupTotal}`

  const buttons = isTop10
    ? [{
        buttonId: `${usedPrefix}classifica`,
        buttonText: { displayText: '📊 Vista semplice' },
        type: 1
      }]
    : [{
        buttonId: `${usedPrefix}classifica top10`,
        buttonText: { displayText: '📊 Top 10 completa' },
        type: 1
      }]

  await conn.sendMessage(m.chat, {
    text,
    buttons,
    mentions: sorted.map(([jid]) => jid),
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(classifica|top|classificagiornaliera)$/i
handler.group = true

export default handler

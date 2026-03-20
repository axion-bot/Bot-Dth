import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `『 🎬 』 Inserisci un link TikTok\n\n✧ Esempio:\n${usedPrefix}${command} https://vm.tiktok.com/xxxxx`,
      m
    )
  }

  await conn.sendMessage(m.chat, { react: { text: "🎬", key: m.key } })

  try {
    let res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (!json || !json.data) {
      return conn.reply(m.chat, '❌ Impossibile ottenere dati.', m)
    }

    let video = json.data.play

    if (!video) {
      return conn.reply(m.chat, '❌ Video non trovato.', m)
    }

    // 🔥 scarica buffer (fix WhatsApp)
    let vidRes = await fetch(video)
    let buffer = await vidRes.buffer()

    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      fileName: 'tiktok.mp4',
      caption: '✅ Video scaricato correttamente'
    }, { quoted: m })

  } catch (err) {
    console.error('Errore download:', err)
    conn.reply(m.chat, '❌ Errore durante il download.', m)
  }
}

handler.help = ['ttslide <url>']
handler.tags = ['download']
handler.command = /^(ttslide|ttslides|tiktokslide)$/i

export default handler

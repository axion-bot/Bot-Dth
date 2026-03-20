let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `『 🎵 』 Inserisci un link di TikTok\n\n✧ Esempio:\n${usedPrefix}${command} https://vm.tiktok.com/xxxxx`,
      m
    )
  }

  await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } })

  try {
    // API downloader corretta
    let res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(text)}`)
    let json = await res.json()

    // DEBUG (se serve)
    // console.log(json)

    if (!json || !json.data || !json.data.music) {
      return conn.reply(m.chat, '❌ Audio non trovato.', m)
    }

    let audioUrl = json.data.music

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: 'tiktok_audio.mp3'
      },
      { quoted: m }
    )

  } catch (err) {
    console.error('Errore ttaudio:', err)
    conn.reply(m.chat, '❌ Errore durante il download.', m)
  }
}

handler.help = ['ttaudio <url>']
handler.tags = ['download']
handler.command = /^(ttaudio|ttmp3|tiktokmp3)$/i

export default handler

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `『 🖼️ 』 Inserisci un link slideshow TikTok\n\n✧ Esempio:\n${usedPrefix}${command} https://vm.tiktok.com/xxxxx`,
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

    let images = json.data.images
    let audio = json.data.music

    if (!images || images.length === 0) {
      return conn.reply(m.chat, '❌ Questo link non è uno slideshow.', m)
    }

    let tempDir = './tmp_slide'
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

    // 📥 Scarica immagini
    let imgPaths = []
    for (let i = 0; i < images.length; i++) {
      let imgRes = await fetch(images[i])
      let buffer = await imgRes.buffer()
      let filePath = path.join(tempDir, `img${i}.jpg`)
      fs.writeFileSync(filePath, buffer)
      imgPaths.push(filePath)
    }

    // 🎵 Scarica audio
    let audioPath = path.join(tempDir, 'audio.mp3')
    if (audio) {
      let audRes = await fetch(audio)
      let buffer = await audRes.buffer()
      fs.writeFileSync(audioPath, buffer)
    }

    // 🎞️ Crea lista immagini per ffmpeg
    let listFile = path.join(tempDir, 'list.txt')
    let listContent = imgPaths.map(img => `file '${img}'\nduration 2`).join('\n')
    listContent += `\nfile '${imgPaths[imgPaths.length - 1]}'`
    fs.writeFileSync(listFile, listContent)

    let outputVideo = path.join(tempDir, 'output.mp4')

    // 🎬 FFmpeg
    let cmd = `ffmpeg -y -f concat -safe 0 -i ${listFile} -i ${audioPath} -shortest -vf "fps=25,format=yuv420p" ${outputVideo}`

    exec(cmd, async (err) => {
      if (err) {
        console.error(err)
        return conn.reply(m.chat, '❌ Errore creazione video.', m)
      }

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(outputVideo),
        caption: '✅ Slideshow convertito in video'
      }, { quoted: m })

      // 🧹 Pulizia
      fs.rmSync(tempDir, { recursive: true, force: true })
    })

  } catch (err) {
    console.error('Errore slideshow:', err)
    conn.reply(m.chat, '❌ Errore durante il download.', m)
  }
}

handler.help = ['ttslide <url>']
handler.tags = ['download']
handler.command = /^(ttslide|ttslides|tiktokslide)$/i

export default handler

import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

const brainrotImages = [
  "https://i.imgur.com/v6kz7mb.jpg",
  "https://i.imgur.com/3693Qnq.jpg",
  "https://i.imgur.com/okhc0vA.jpg",
  "https://i.imgur.com/6vmd1jh.jpg"
]

// Coordinate per la faccia in ogni immagine brainrot [x, y, width, height]
const faceCoords = [
  [150, 120, 180, 180],
  [120, 100, 200, 200],
  [140, 110, 180, 180],
  [130, 90, 220, 220]
]

async function brainrotFace(userBuffer) {
  // Scegli un brainrot a caso
  const index = Math.floor(Math.random() * brainrotImages.length)
  const brainrotUrl = brainrotImages[index]
  const coords = faceCoords[index]

  // Scarica immagine brainrot
  const res = await fetch(brainrotUrl)
  const brainrotBuffer = Buffer.from(await res.arrayBuffer())
  const brainrotImg = await loadImage(brainrotBuffer)

  const userImg = await loadImage(userBuffer)

  const canvas = createCanvas(brainrotImg.width, brainrotImg.height)
  const ctx = canvas.getContext('2d')

  // Disegna immagine brainrot base
  ctx.drawImage(brainrotImg, 0, 0)

  // Sovrapponi foto profilo dell’utente
  ctx.drawImage(userImg, coords[0], coords[1], coords[2], coords[3])

  return canvas.toBuffer("image/jpeg")
}

let handler = async (m, { conn }) => {
  let who = m.sender
  if (m.quoted) who = m.quoted.sender
  if (m.mentionedJid?.[0]) who = m.mentionedJid[0]

  try {
    const ppUrl = await conn.profilePictureUrl(who, 'image')
    const res = await fetch(ppUrl)
    const userBuffer = Buffer.from(await res.arrayBuffer())

    const result = await brainrotFace(userBuffer)

    await conn.sendFile(
      m.chat,
      result,
      'brainrot.jpg',
      '*🧠 Brainrot con la tua faccia!*',
      m,
      false,
      { mentions: [who] }
    )
  } catch (e) {
    console.error(e)
    m.reply("Errore nella generazione brainrot.")
  }
}

handler.help = ['brainrot']
handler.tags = ['fun']
handler.command = /^brainrot$/i

export default handler
import { WAMessageStubType } from '@realvare/baileys'
import axios from 'axios'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

let puppeteer
let browser

/* ================= INIT ================= */

async function initBrowser() {
  if (browser) return
  puppeteer = await import('puppeteer')
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote'
    ]
  })
}

/* ================= CREATE IMAGE ================= */

async function createImage(html) {
  if (!browser) await initBrowser()

  const page = await browser.newPage()

  await page.setViewport({
    width: 1600,
    height: 900,
    deviceScaleFactor: 2
  })

  await page.setContent(html)

  // aspetta font + immagine
  await page.evaluateHandle('document.fonts.ready')
  await page.waitForSelector('.pfp')
  await page.waitForFunction(() => {
    const img = document.querySelector('.pfp')
    return img && img.complete && img.naturalHeight > 0
  })

  const buffer = await page.screenshot({
    type: 'jpeg',
    quality: 95
  })

  await page.close()
  return buffer
}

/* ================= PROFILE PIC ================= */

async function getProfilePic(conn, jid) {
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(res.data)
  } catch {
    return null
  }
}

/* ================= CARD ================= */

const WelcomeCard = ({ pfpUrl, isGoodbye }) => {
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;900&display=swap');

    body {
      margin:0;
      width:1600px;
      height:900px;
      display:flex;
      justify-content:center;
      align-items:center;
      background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
      font-family:'Poppins', sans-serif;
    }

    .card{
      width:90%;
      height:85%;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      background:rgba(0,0,0,0.6);
      backdrop-filter:blur(25px);
      border-radius:60px;
      color:white;
      text-align:center;
    }

    .pfp{
      width:500px;
      height:500px;
      border-radius:50%;
      border:12px solid white;
      object-fit:cover;
      box-shadow:0 0 100px rgba(255,255,255,0.9);
      margin-bottom:50px;
    }

    .title{
      font-size:130px;
      font-weight:900;
      letter-spacing:4px;
      text-shadow:
        0 0 20px rgba(255,255,255,0.8),
        0 0 40px rgba(255,255,255,0.6),
        0 0 60px rgba(255,255,255,0.4);
    }
  `

  return React.createElement('html', {},
    React.createElement('head', {},
      React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } })
    ),
    React.createElement('body', {},
      React.createElement('div', { className: 'card' },
        React.createElement('img', { src: pfpUrl, className: 'pfp' }),
        React.createElement('div', { className: 'title' },
          isGoodbye 
            ? '𝐌𝐢 𝐬𝐚 𝐜𝐡𝐞 𝐡𝐚 𝐪𝐮𝐢𝐭𝐭𝐚𝐭𝐨'
            : '𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨'
        )
      )
    )
  )
}

/* ================= HANDLER ================= */

let handler = m => m

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.messageStubType) return false

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat || (!chat.welcome && !chat.goodbye)) return false

  const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isRemove =
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

  if (!isAdd && !isRemove) return false

  const who = m.messageStubParameters?.[0]
  if (!who) return false

  const jid = conn.decodeJid(who)
  const cleanUserId = jid.split('@')[0]

  const pfp = await getProfilePic(conn, jid)
  if (!pfp) return false

  const base64 = `data:image/jpeg;base64,${pfp.toString('base64')}`

  const element = React.createElement(WelcomeCard, {
    pfpUrl: base64,
    isGoodbye: isRemove
  })

  const html = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`
  const image = await createImage(html)

  const caption = isRemove
    ? `@${cleanUserId} 𝐌𝐢 𝐬𝐚 𝐜𝐡𝐞 𝐡𝐚 𝐪𝐮𝐢𝐭𝐭𝐚𝐭𝐨`
    : `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨`

  await conn.sendMessage(
    m.chat,
    {
      image: image,
      caption: caption,
      mentions: [jid]
    },
    { quoted: m }
  )

  return true
}

export default handler
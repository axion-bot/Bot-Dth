let handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) {

return conn.reply(

m.chat,

『 🖼️ 』 Inserisci un link slideshow TikTok\n\n✧ Esempio:\n${usedPrefix}${command} https://vm.tiktok.com/xxxxx,

m

)

}


await conn.sendMessage(m.chat, { react: { text: "🖼️", key: m.key } })


try {

let res = await fetch(https://tikwm.com/api/?url=${encodeURIComponent(text)})

let json = await res.json()


if (!json || !json.data) {  
  return conn.reply(m.chat, '❌ Impossibile ottenere dati.', m)  
}  

let images = json.data.images  
let audio = json.data.music  

// 📸 Se è slideshow  
if (images && images.length > 0) {  

  // invia immagini una per una  
  for (let img of images) {  
    await conn.sendMessage(m.chat, {  
      image: { url: img }  
    }, { quoted: m })  
  }  

  // 🎵 invia audio  
  if (audio) {  
    await conn.sendMessage(m.chat, {  
      audio: { url: audio },  
      mimetype: 'audio/mpeg',  
      fileName: 'slideshow_audio.mp3'  
    }, { quoted: m })  
  }  

} else {  
  return conn.reply(m.chat, '❌ Questo link non è uno slideshow.', m)  
}  



} catch (err) {

console.error('Errore slideshow:', err)

conn.reply(m.chat, '❌ Errore durante il download.', m)

}

}


handler.help = ['ttslide ']

handler.tags = ['download']

handler.command = /^(ttslide|ttslides|tiktokslide)$/i


export default handler

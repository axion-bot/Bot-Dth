import fs from "fs"

let handler = async (m, { conn, args, usedPrefix, command }) => {

let who = m.sender

if (!global.db.data.users[who]) global.db.data.users[who] = {}
let user = global.db.data.users[who]

if (typeof user.euro === 'undefined') user.euro = 0

let bet = parseInt(args[0])

// MENU CON BOTTONI
if (!bet || isNaN(bet) || bet <= 0) {

let buttons = [
{ buttonId: `${usedPrefix + command} 10`, buttonText: { displayText: "💰 Punta 10€" }, type: 1 },
{ buttonId: `${usedPrefix + command} 50`, buttonText: { displayText: "💰 Punta 50€" }, type: 1 },
{ buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: "💰 Punta 100€" }, type: 1 },
{ buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: "💰 Punta 500€" }, type: 1 }
]

let caption = `
🎰 *SNAI BET*

👤 Utente: @${who.split('@')[0]}
💶 Saldo: ${user.euro} €

Seleziona la puntata 👇
`.trim()

return conn.sendMessage(m.chat,{
image: fs.readFileSync("./media/snai.png"),
caption,
footer:"⚽ Sistema Scommesse",
buttons,
headerType:4,
mentions:[who]
},{ quoted:m })
}

// CONTROLLO SALDO
if (user.euro < bet) {
return m.reply(`💸 Saldo insufficiente\nHai ${user.euro}€`)
}

// SQUADRE
const squadre = [
"Inter","Milan","Juventus","Napoli",
"Roma","Lazio","Atalanta","Fiorentina",
"Torino","Bologna"
]

let casa = squadre[Math.floor(Math.random()*squadre.length)]
let trasf = squadre.filter(s => s !== casa)[Math.floor(Math.random()*(squadre.length-1))]

// QUOTA
let quota = (Math.random()*(4-1.5)+1.5).toFixed(2)
let vincita = Math.floor(bet * quota)

user.euro -= bet

// IMMAGINE MATCH
let matchImage = `https://dummyimage.com/900x500/111/ffffff&text=${encodeURIComponent(casa+" VS "+trasf)}`

// TICKET
await conn.sendMessage(m.chat,{
image:{ url: matchImage },
caption:`
🎫 *BIGLIETTO CONFERMATO*

⚔️ ${casa} vs ${trasf}

💰 Puntata: ${bet}€
📈 Quota: x${quota}
🏆 Vincita possibile: ${vincita}€

⏳ La partita sta iniziando...
`,
mentions:[who]
},{ quoted:m })

// TELECRONACA
const cronaca = [

{t:2000,txt:`🔔 Calcio d'inizio!`},

{t:2500,txt:`⚡ 10' ${casa} attacca sulla fascia!`},

{t:2500,txt:`🔥 18' Tiro del ${trasf}... PARATA! 🧤`},

{t:2500,txt:`😱 25' PALO del ${casa}!`},

{t:2500,txt:`🟨 33' Cartellino giallo.`},

{t:2500,txt:`⚽ 38' GOAL! Lo stadio esplode!`},

{t:2500,txt:`⏸ Fine primo tempo.`},

{t:2500,txt:`▶️ Inizia il secondo tempo.`},

{t:2500,txt:`🖥 VAR check in corso...`},

{t:2500,txt:`🔥 70' ${trasf} spinge forte!`},

{t:2500,txt:`😱 TRAVERSA! Che occasione!`},

{t:2500,txt:`⏳ 90' Recupero!`}
]

for (let step of cronaca){
await new Promise(r=>setTimeout(r,step.t))
await conn.sendMessage(m.chat,{text:step.txt})
}

// RISULTATO
await new Promise(r=>setTimeout(r,3000))

let win = Math.random() > 0.4 // 60%

let g1 = Math.floor(Math.random()*4)
let g2 = Math.floor(Math.random()*4)

if(win){

if(g1<=g2) g1 = g2+1

user.euro += vincita

await conn.sendMessage(m.chat,{
text:`
🏁 *FISCHIO FINALE*

${casa} ${g1} - ${g2} ${trasf}

✅ SCHEDINA VINTA

💰 +${vincita}€
🏦 Saldo: ${user.euro}€
`,
mentions:[who]
})

}else{

if(g2<=g1) g2 = g1+1

await conn.sendMessage(m.chat,{
text:`
🏁 *FISCHIO FINALE*

${casa} ${g1} - ${g2} ${trasf}

❌ SCHEDINA PERSA

📉 -${bet}€
`,
mentions:[who]
})

}

}

handler.help = ['schedina']
handler.tags = ['game']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler
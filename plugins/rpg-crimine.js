let handler = async (m, { conn, usedPrefix, command, args }) => {
    let user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = { euro: 0, lastCrime: 0, isJailed: false }
    let u = global.db.data.users[user]

    // --- CONTROLLO PRIGIONE ---
    if (u.isJailed) {
        let tempoRimanente = u.jailTime - new Date()
        if (tempoRimanente > 0) {
            let minuti = Math.ceil(tempoRimanente / 60000)
            return conn.reply(m.chat, `🔒 Sei ancora dietro le sbarre! Devi scontare ancora *${minuti} minuti*. Non fare il bullo con le guardie!`, m)
        } else {
            u.isJailed = false // Tempo scaduto, può uscire
        }
    }

    // --- LOGICA EVASIONE (Comando nascosto attivato dai bottoni) ---
    if (command === 'evadi') {
        const successoEvasione = Math.random() < 0.3 // 30% di successo
        if (successoEvasione) {
            u.isJailed = false
            u.jailTime = 0
            return conn.reply(m.chat, "🏃‍♂️💨 *INCREDIBILE!* Sei riuscito a strisciare fuori dai condotti dell'aria. Sei di nuovo un uomo libero!", m)
        } else {
            u.jailTime = new Date() * 1 + 600000 // Aggiunge altri 10 minuti se fallisce
            return conn.reply(m.chat, "👮‍♂️ *PRESO!* Le guardie ti hanno visto mentre saltavi il muro. Ti hanno dato altri 10 minuti di isolamento!", m)
        }
    }

    // --- CONFIGURAZIONE CRIMINI ---
    const crimes = [
        { name: "Rapina in banca 🏦", successRate: 0.35, reward: [1000, 2500] },
        { name: "Furto in villa 🏠", successRate: 0.50, reward: [400, 900] },
        { name: "Scippo 💨", successRate: 0.70, reward: [100, 300] }
    ]

    const crime = crimes[Math.floor(Math.random() * crimes.length)]
    const success = Math.random() < crime.successRate
    const amount = Math.floor(Math.random() * (crime.reward[1] - crime.reward[0] + 1)) + crime.reward[0]

    if (success) {
        u.euro += amount
        await conn.sendMessage(m.chat, {
            text: `🕶️ *COLPO RIUSCITO!*\nHai eseguito: ${crime.name}\n💶 Guadagno: +${amount}€\n💰 Totale: ${u.euro}€`,
            buttons: [{ buttonId: `${usedPrefix}crimine`, buttonText: { displayText: '🔁 Riprova' }, type: 1 }],
            headerType: 1
        }, { quoted: m })
    } else {
        // --- FALLIMENTO: VA IN PRIGIONE ---
        u.isJailed = true
        u.jailTime = new Date() * 1 + 300000 // 5 minuti (300.000 ms)
        
        const txtFail = `🚔 *ARRESTATO!*\nIl colpo "${crime.name}" è andato male. Le guardie ti hanno portato alla prigione centrale.\n\n⏳ *Pena:* 5 Minuti\nCosa vuoi fare?`
        
        const jailButtons = [
            { buttonId: `${usedPrefix}evadi`, buttonText: { displayText: '🏃‍♂️ Tenta l\'evasione' }, type: 1 },
            { buttonId: `${usedPrefix}zaino`, buttonText: { displayText: '🎒 Guarda lo zaino' }, type: 1 }
        ]

        await conn.sendMessage(m.chat, {
            text: txtFail,
            buttons: jailButtons,
            headerType: 1
        }, { quoted: m })
    }
}

handler.command = /^(crimine|evadi)$/i
export default handler

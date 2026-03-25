let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`📌 Esempio: .add 393471234567`)

    let num = text.replace(/[^0-9]/g, '')
    
    if (num.length < 10 || num.length > 15) return m.reply('❌ Numero non valido')

    const jid = num + '@s.whatsapp.net'
    
    try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
        await conn.sendMessage(m.chat, {
            text: `✅ @${num} aggiunto`,
            mentions: [jid]
        }, { quoted: m })
    } catch (error) {
        m.reply('❌ Errore, riprova')
    }
}

handler.command = /^(add|aggiungi)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Solo nei gruppi')
    if (!isAdmin && !isOwner) return m.reply('❌ Solo admin')
    
    const isBotAdmin = (await conn.groupMetadata(m.chat)).participants.find(v => v.id === conn.user.jid)?.admin || false
    if (!isBotAdmin) return m.reply('❌ Il bot deve essere admin')
    
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

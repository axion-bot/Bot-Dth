const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, isBotAdmin, isAdmin }) => {
  // Solo per admin del gruppo
  if (!isAdmin) return 
  
  // Il bot deve essere admin
  if (!isBotAdmin) return m.reply('⚠️ Il bot deve essere admin.')

  try {
    // 1. APRE IL GRUPPO (Disattiva approvazione)
    await conn.groupUpdateMembershipApprovalMode(m.chat, 'off')
    
    // Notifica veloce
    await conn.sendMessage(m.chat, { text: '🔓 *ACCESSO LIBERO* (2s)' }, { quoted: m })

    // 2. ATTENDE 2 SECONDI
    await delay(2000)

    // 3. CHIUDE IL GRUPPO (Riattiva approvazione)
    await conn.groupUpdateMembershipApprovalMode(m.chat, 'on')
    
    // Notifica di chiusura
    await conn.sendMessage(m.chat, { text: '🔒 *ACCESSO CHIUSO*' }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore: Assicurati che l\'approvazione sia supportata in questo gruppo.')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = ['accetta', 'acetta'] 

handler.group = true
handler.admin = true 
handler.botAdmin = true

export default handler

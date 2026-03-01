const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, isBotAdmin, isAdmin }) => {
  // Solo per admin del gruppo
  if (!isAdmin) return 
  
  // Il bot deve essere admin
  if (!isBotAdmin) return m.reply('⚠️ Il bot deve essere admin.')

  try {
    // 1. APRE IL GRUPPO (Disattiva approvazione)
    // Usiamo il metodo universale 'membership_approval_mode'
    await conn.groupUpdateSetting(m.chat, 'membership_approval_mode', 'off')
    
    await conn.sendMessage(m.chat, { text: '🔓 *ACCESSO LIBERO* (2s)' }, { quoted: m })

    // 2. ATTENDE 2 SECONDI
    await delay(2000)

    // 3. CHIUDE IL GRUPPO (Riattiva approvazione)
    await conn.groupUpdateSetting(m.chat, 'membership_approval_mode', 'on')
    
    await conn.sendMessage(m.chat, { text: '🔒 *ACCESSO CHIUSO*' }, { quoted: m })

  } catch (e) {
    console.error("ERRORE_APPROVAZIONE:", e)
    m.reply('❌ Il comando è corretto ma il gruppo non sembra supportare l\'approvazione membri (controlla le impostazioni manuali).')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = ['accetta', 'acetta'] 

handler.group = true
handler.admin = true 
handler.botAdmin = true

export default handler

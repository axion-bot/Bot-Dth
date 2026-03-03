import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ Questo comando può essere usato solo nei gruppi.');
  }

  // Verifica che l'utente sia owner
  let isOwner = global.db.data.users[m.sender]?.owner || false;
  if (!isOwner) {
    return m.reply('⚠️ Solo il proprietario del bot può usare questo comando.');
  }

  // Estrai il numero di telefono
  let phoneNumber = args[0]?.replace(/[^0-9]/g, '');
  
  if (!phoneNumber) {
    return m.reply(`📱 *COMANDO OSINT WHATSAPP*\n\n` +
      `Inserisci il numero da analizzare:\n` +
      `${usedPrefix + command} 391234567890\n\n` +
      `Oppure rispondi a un messaggio:\n` +
      `${usedPrefix + command} reply`);
  }

  // Se risponde a un messaggio, prendi il numero da lì
  if (m.quoted) {
    const quotedNumber = m.quoted.sender?.split('@')[0];
    if (quotedNumber) {
      phoneNumber = quotedNumber;
    }
  }

  // Validazione base
  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return m.reply('❌ Numero di telefono non valido. Deve contenere 10-15 cifre.');
  }

  // Formatta il numero (senza +)
  const formattedNumber = phoneNumber; // Già senza caratteri speciali

  // Messaggio di attesa
  await m.reply(`🔍 *RICERCA OSINT IN CORSO...*\n\n📱 Numero: ${formattedNumber}\n⏱️ Attendere prego`);

  try {
    // NOTA: Questa è una SIMULAZIONE per scopi dimostrativi
    // Per usare API reali, dovresti registrarti su RapidAPI
    
    // Simula tempi di risposta
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dati simulati (in un'implementazione reale, chiameresti un'API)
    const mockData = generateMockData(formattedNumber);
    
    // Costruisci il messaggio di risposta
    const resultMessage = `
╔══════════════════════╗
   📱 *WHATSAPP OSINT* 📱
╚══════════════════════╝

👤 *NUMERO:* ${formattedNumber}
${mockData.hasWhatsapp ? '✅ *STATUS:* Account WhatsApp attivo' : '❌ *STATUS:* Account non trovato'}

📸 *FOTO PROFILO:* ${mockData.hasPhoto ? '✅ Presente' : '❌ Non disponibile/nascosta'}
🏢 *BUSINESS:* ${mockData.isBusiness ? '✅ Account Business' : '❌ Account personale'}

📝 *INFO AGGIUNTIVE:*
${mockData.info}

⚙️ *PRIVACY:*
• Ultimo accesso: ${mockData.lastSeen}
• Foto profilo: ${mockData.privacyPhoto}
• Info: ${mockData.privacyAbout}

📱 *DISPOSITIVI COLLEGATI:* ${mockData.devices}

⏱️ *RICERCA EFFETTUATA IL:* ${new Date().toLocaleString('it-IT')}

⚠️ *NOTA:* I dati mostrati sono simulati per dimostrazione
    `.trim();

    await conn.sendMessage(m.chat, {
      text: resultMessage,
      contextInfo: {
        mentionedJid: [m.sender]
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Errore in osint:', error);
    await m.reply(`❌ *ERRORE*\n\nImpossibile completare la ricerca.\n\nDettagli: ${error.message}`);
  }
};

// Funzione per generare dati simulati
function generateMockData(phoneNumber) {
  // Crea dati fittizi basati sul numero per rendere l'output variabile
  const hash = phoneNumber.split('').reduce((a, b) => a + parseInt(b), 0);
  const random = (min, max) => Math.floor((hash % (max - min + 1)) + min);
  
  const hasWhatsapp = random(0, 10) > 1; // 90% di probabilità
  const isBusiness = random(0, 10) > 7; // 30% di probabilità
  const hasPhoto = random(0, 10) > 2; // 80% di probabilità
  
  const lastSeenOptions = ['Visibile a tutti', 'Visibile ai contatti', 'Nessuno', 'Ultimo accesso sconosciuto'];
  const privacyOptions = ['Tutti', 'I miei contatti', 'Nessuno'];
  
  const devicesCount = random(1, 4);
  const deviceTypes = ['iPhone', 'Android', 'Web Client', 'Windows App', 'iPad'];
  
  let devicesList = '';
  for (let i = 0; i < devicesCount; i++) {
    const randomDevice = deviceTypes[random(0, deviceTypes.length - 1)];
    const lastActive = random(1, 60);
    devicesList += `  • ${randomDevice} (attivo ${lastActive} minuti fa)\n`;
  }
  
  return {
    hasWhatsapp,
    hasPhoto,
    isBusiness,
    lastSeen: lastSeenOptions[random(0, lastSeenOptions.length - 1)],
    privacyPhoto: privacyOptions[random(0, privacyOptions.length - 1)],
    privacyAbout: privacyOptions[random(0, privacyOptions.length - 1)],
    devices: `\n${devicesList || '  • Nessun dispositivo rilevato'}`,
    info: isBusiness ? 
      '  • Account verificato\n  • Categoria: Servizi\n  • Orari: 9:00-18:00' : 
      '  • Account personale standard'
  };
}

// Configurazione del comando
handler.help = ['osint <numero>', 'osint reply'];
handler.tags = ['owner'];
handler.command = ['osint', 'osintwa', 'wainfo'];
handler.group = true;
handler.owner = true;

export default handler;
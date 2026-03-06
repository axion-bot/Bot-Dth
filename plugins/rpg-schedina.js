let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m.sender
    if (!global.db.data.users[who]) global.db.data.users[who] = {}
    let user = global.db.data.users[who]
    
    if (typeof user.euro === 'undefined') user.euro = 0

    let bet = parseInt(args[0])
    
    // Menu iniziale se manca la puntata
    if (!bet || isNaN(bet) || bet <= 0) {
        let menu = `
╭━━━ 🎰 *ＳＮＡI  ＢＥＴ* ━━━╮
┃
┃ 👤 *UTENTE:* @${who.split('@')[0]}
┃ 💶 *SALDO:* ${user.euro} €
┃
┃ 📝 *PUNTATE RAPIDE:*
┃ 🔹 ${usedPrefix + command} 10
┃ 🔹 ${usedPrefix + command} 50
┃ 🔹 ${usedPrefix + command} 100
┃
╰━━━━━━━━━━━━━━━━━━━━╯`.trim()
        return conn.sendMessage(m.chat, { text: menu, mentions: [who] }, { quoted: m })
    }

    if (user.euro < bet) {
        return m.reply(`💸 *SALDO INSUFFICIENTE*\n\nHai solo ${user.euro} €. Te ne servono altri ${bet - user.euro} per questa giocata!`)
    }

    const squadre = ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Torino", "Bologna"];
    let casa = squadre[Math.floor(Math.random() * squadre.length)];
    let trasf = squadre.filter(s => s !== casa)[Math.floor(Math.random() * (squadre.length - 1))];
    
    let quota = (Math.random() * (5.0 - 1.2) + 1.2).toFixed(2);
    let vincita = Math.floor(bet * quota);

    user.euro -= bet;

    // --- 1. IL BIGLIETTO ---
    let ticket = `
╭━━━ 🎫 *ＴＩＣＫＥＴ  ＰＩＡＺＺＡＴＯ* ━━━╮
┃
┃ 🏟️ *MATCH:* ${casa} - ${trasf}
┃ 💵 *PUNTATA:* ${bet} €
┃ 📈 *QUOTA:* x${quota}
┃ 💰 *VINCITA:* ${vincita} €
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*FISCHIO D'INIZIO! SI GIOCA!* ⚽`.trim();

    await conn.sendMessage(m.chat, { text: ticket, mentions: [who] }, { quoted: m });

    // --- 2. TELECRONACA (Messaggi separati) ---
    const cronaca = [
        { t: 2500, txt: `🕒 *25' MINUTO:* Il ${casa} attacca ferocemente! Tiro da fuori... parata centrale del portiere! 🧤` },
        { t: 3000, txt: `🌓 *45' MINUTO:* Duplice fischio! Squadre negli spogliatoi sullo 0-0. @${who.split('@')[0]} la bolla è ancora viva! ☕` },
        { t: 3000, txt: `🖥️ *60' MINUTO:* VAR! Possibile fallo in area del ${trasf}... L'arbitro lascia correre tra le proteste! 🚫` },
        { t: 3000, txt: `🔥 *80' MINUTO:* TRAVERSA! Il ${casa} vicinissimo al gol del vantaggio! Che brivido! 😱` },
        { t: 3500, txt: `⏳ *90' MINUTO:* Inizia il recupero! Tutti in avanti per l'ultima occasione! ⏱️` }
    ];

    for (let step of cronaca) {
        await new Promise(res => setTimeout(res, step.t));
        await conn.sendMessage(m.chat, { text: step.txt, mentions: [who] });
    }

    // --- 3. ESITO FINALE ---
    await new Promise(res => setTimeout(res, 4000));
    let win = Math.random() > 0.7; // 30% di vincita
    let g1 = Math.floor(Math.random() * 4);
    let g2 = win ? Math.max(0, g1 - 1) : (g1 === 0 ? 1 : g1 + (Math.random() > 0.5 ? 1 : 0));

    if (win) {
        user.euro += vincita;
        let winFinal = `
✨ *ＣＡＳＨ  ＯＵＴ  ＳＵＣＣＥＳＳ* ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 *FINALE:* ${casa} ${g1} - ${g2} ${trasf}

✅ *ESITO:* VINCENTE
💰 *VINCITA:* +${vincita} €
🏦 *NUOVO SALDO:* ${user.euro} €

*Hai sbancato tutto! Sei il re della schedina!* 👑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
        await conn.sendMessage(m.chat, { text: winFinal, mentions: [who] });
    } else {
        let loseFinal = `
💀 *ＢＯＬＬＡ  ＥＳＰＬＯＳＡ* 💀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 *FINALE:* ${casa} ${g1} - ${g2} ${trasf}

❌ *ESITO:* PERDENTE
📉 *PERDITA:* -${bet} €

━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
        await conn.sendMessage(m.chat, { text: loseFinal, mentions: [who] });
    }
}

handler.help = ['schedina']
handler.tags = ['euro']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler

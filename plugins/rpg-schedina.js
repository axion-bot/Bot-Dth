let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m.sender
    if (!global.db.data.users[who]) global.db.data.users[who] = {}
    let user = global.db.data.users[who]
    
    // Inizializza i soldi se non esistono
    if (typeof user.euro === 'undefined') user.euro = 0

    let bet = parseInt(args[0])
    if (!bet || isNaN(bet) || bet <= 0) {
        return m.reply(`🎰 *ERRORE SCHEDINA*\n\nInserisci una cifra valida da scommettere.\nEsempio: *${usedPrefix + command} 50*`)
    }

    if (user.euro < bet) {
        return m.reply(`💸 *NON HAI ABBASTANZA EURO!*\n\nTi mancano ${bet - user.euro} € per piazzare questa scommessa.`)
    }

    // Lista Squadre Serie A per simulazione
    const squadre = ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Torino", "Bologna"];
    let casa = squadre[Math.floor(Math.random() * squadre.length)];
    let trasferta = squadre.filter(s => s !== casa)[Math.floor(Math.random() * (squadre.length - 1))];
    
    // Quote simulate
    let quota = (Math.random() * (3.5 - 1.2) + 1.2).toFixed(2);
    let vincitaPotenziale = Math.floor(bet * quota);

    // Sottrai i soldi
    user.euro -= bet;

    let initMsg = `
╔════ ⚽ *SCOMMESSA PIAZZATA* ⚽ ════╗
┃
┃ 🏟️ *MATCH:* ${casa} vs ${trasferta}
┃ 💰 *PUNTATA:* ${bet} €
┃ 📈 *QUOTA:* x${quota}
┃ 🏆 *POTENZIALE VINCITA:* ${vincitaPotenziale} €
┃
╚══════════════════════════════════╝
⏳ *Simulazione in corso...*`.trim();

    await m.reply(initMsg);

    // Simulazione eventi (Live Match)
    await new Promise(res => setTimeout(res, 2500));
    await m.reply(`📢 *30' MINUTO:* Il match è bloccato sullo 0-0. ${casa} preme in attacco!`);
    
    await new Promise(res => setTimeout(res, 2500));
    
    // Calcolo Risultato
    let win = Math.random() > 0.55; // 45% di probabilità di vittoria
    let scoreCasa = Math.floor(Math.random() * 4);
    let scoreTrasferta = win ? Math.max(0, scoreCasa - 1) : Math.floor(Math.random() * 4);
    
    // Se doveva vincere ma il random ha dato pareggio/sconfitta, forziamo un po' il brivido
    if (win && scoreCasa <= scoreTrasferta) scoreCasa = scoreTrasferta + 1;

    let resultMsg = "";
    if (win) {
        user.euro += vincitaPotenziale;
        resultMsg = `
🎉 *ＷＩＮＮＥＲ* 🎉
━━━━━━━━━━━━━━━━━━━━
🏟️ *RISULTATO:* ${casa} ${scoreCasa} - ${scoreTrasferta} ${trasferta}

✅ La schedina è *VINCENTE*!
💰 Hai incassato: +${vincitaPotenziale} €

📝 *Nuovo Saldo:* ${user.euro} €
━━━━━━━━━━━━━━━━━━━━`.trim();
    } else {
        resultMsg = `
❌ *ＬＯＳＥＲ* ❌
━━━━━━━━━━━━━━━━━━━━
🏟️ *RISULTATO:* ${casa} ${scoreCasa} - ${scoreTrasferta} ${trasferta}

📉 Schedina *PERDENTE*.
💸 Hai perso i tuoi ${bet} €.

*Nota:* Per recuperare i soldi, dovresti fare **3.750 passi** (2,5 km) per schiarirti le idee!
━━━━━━━━━━━━━━━━━━━━`.trim();
    }

    await conn.sendMessage(m.chat, { text: resultMsg, mentions: [who] }, { quoted: m });
}

handler.help = ['schedina <euro>']
handler.tags = ['euro']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler

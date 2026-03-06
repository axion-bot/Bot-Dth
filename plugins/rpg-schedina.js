let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m.sender
    if (!global.db.data.users[who]) global.db.data.users[who] = {}
    let user = global.db.data.users[who]
    
    if (typeof user.euro === 'undefined') user.euro = 0

    let bet = parseInt(args[0])
    
    // Se non specifica la puntata, mostriamo un menu interattivo (Simulato con messaggi cliccabili)
    if (!bet || isNaN(bet) || bet <= 0) {
        let menu = `
╭━━━ 🎰 *ＳＮＡI  ＢＥＴ* ━━━╮
┃
┃ 👤 *UTENTE:* @${who.split('@')[0]}
┃ 💶 *SALDO:* ${user.euro} €
┃
┃ 📝 *COME GIOCARE:*
┃ Scrivi *${usedPrefix + command} <cifra>*
┃
┃ *PUNTATE RAPIDE:*
┃ 🔹 ${usedPrefix + command} 10
┃ 🔹 ${usedPrefix + command} 50
┃ 🔹 ${usedPrefix + command} 100
┃
╰━━━━━━━━━━━━━━━━━━━━╯`.trim()
        return conn.sendMessage(m.chat, { text: menu, mentions: [who] }, { quoted: m })
    }

    if (user.euro < bet) {
        return m.reply(`💸 *SALDO INSUFFICIENTE*\n\nTi mancano ${bet - user.euro} € per questa giocata!`)
    }

    const squadre = ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Torino", "Bologna"];
    let casa = squadre[Math.floor(Math.random() * squadre.length)];
    let trasf = squadre.filter(s => s !== casa)[Math.floor(Math.random() * (squadre.length - 1))];
    
    let quota = (Math.random() * (5.0 - 1.2) + 1.2).toFixed(2);
    let vincita = Math.floor(bet * quota);

    user.euro -= bet;

    // --- STEP 1: IL BIGLIETTO ---
    let ticket = `
╭━━━ 🎫 *ＴＩＣＫＥＴ  ＣＯＮＦＩＲＭＥＤ* ━━━╮
┃
┃ 🏟️ *MATCH:* ${casa} - ${trasf}
┃ 💵 *PUNTATA:* ${bet} €
┃ 📈 *QUOTA:* x${quota}
┃ 💰 *VINCITA:* ${vincita} €
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*IL MATCH STA PER INIZIARE...* 🏟️`.trim();

    let { key } = await conn.sendMessage(m.chat, { text: ticket, mentions: [who] }, { quoted: m });

    // --- TELECRONACA MULTI-STEP ---
    const cronaca = [
        { t: 2000, txt: `🕒 *15' MINUTO:* Fase di studio. Il ${casa} mantiene il possesso palla. @${who.split('@')[0]} incrocia le dita...` },
        { t: 4000, txt: `🌓 *45' MINUTO:* Intervallo! Squadre sullo 0-0. Partita molto tattica al limite della noia. 🥱` },
        { t: 6000, txt: `🖥️ *65' MINUTO:* VAR! Possibile rigore per il ${trasf}... L'arbitro va al monitor... NON È RIGORE! Si prosegue! 🚫` },
        { t: 8000, txt: `🔥 *82' MINUTO:* PALO! Clamoroso legno colpito da ${casa}! La bolla sta per saltare... 😱` },
        { t: 10000, txt: `⏳ *90' MINUTO:* Recupero infuocato! 5 minuti di speranza o di dolore... ⏱️` }
    ];

    for (let step of cronaca) {
        await new Promise(res => setTimeout(res, step.t / 2)); // Velocizziamo un po' i tempi morti
        await conn.sendMessage(m.chat, { text: step.txt, edit: key, mentions: [who] });
    }

    // --- ESITO FINALE ---
    await new Promise(res => setTimeout(res, 3000));
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

*Hai battuto il banco! Sei un drago delle scommesse!* 🐉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
        await conn.sendMessage(m.chat, { text: winFinal, mentions: [who] }, { edit: key });
    } else {
        let loseFinal = `
💀 *ＢＯＬＬＡ  ＥＳＰＬＯＳＡ* 💀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 *FINALE:* ${casa} ${g1} - ${g2} ${trasf}

❌ *ESITO:* PERDENTE
📉 *PERDITA:* -${bet} €

*La fortuna non era dalla tua.* Per smaltire la delusione, fai **3.750 passi** (2,5 km)! 🚶‍♂️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
        await conn.sendMessage(m.chat, { text: loseFinal, mentions: [who] }, { edit: key });
    }
}

handler.help = ['schedina']
handler.tags = ['euro']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler

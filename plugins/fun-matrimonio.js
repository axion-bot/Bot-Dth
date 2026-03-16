const proposals = {}
const adoptions = {}
const lovers = {}

let handler = async (m, { conn, command, usedPrefix }) => {
    const users = global.db.data.users
    if (!users[m.sender]) users[m.sender] = {}

    switch (command) {
        case 'sposa':
            return sposa(m, conn, users, usedPrefix)
        case 'divorzia':
            return divorzia(m, users)
        case 'adotta':
            return adotta(m, conn, users, usedPrefix)
        case 'famiglia':
            return famiglia(m, users)
        case 'toglifiglio':
            return togliFiglio(m, users)
        case 'amante':
            return amante(m, conn, users, usedPrefix)
        case 'togliamante':
            return togliAmante(m, users)
    }
}

/* ================= 💍 MATRIMONIO ================= */
async function sposa(m, conn, users, usedPrefix) {
    const sender = m.sender
    const target = m.mentionedJid?.[0] || m.quoted?.sender

    if (!target) throw `Usa: ${usedPrefix}sposa @utente`
    if (target === sender) throw '❌ Non puoi sposarti da solo'
    if (!users[target]) users[target] = {}

    if (users[sender].sposato)
        throw `💍 *SEI GIÀ SPOSATO*

❤️ Coniuge:
${tagUser(users[sender].coniuge)}

Usa *.divorzia* prima.`

    if (users[target].sposato)
        throw `💍 *PERSONA GIÀ OCCUPATA*

${tagUser(target)} è già sposato/a.`

    if (proposals[sender] || proposals[target])
        throw '⏳ C’è già una proposta in corso'

    proposals[target] = sender
    proposals[sender] = target

    await conn.sendMessage(m.chat, {
        text:
`💖 *PROPOSTA DI MATRIMONIO* 💖

${tagUser(sender)} vuole sposare ${tagUser(target)} 💍

Rispondi:
✔️ *SI* per accettare  
❌ *NO* per rifiutare`,
        mentions: [sender, target]
    })

    setTimeout(() => {
        if (proposals[target]) {
            delete proposals[target]
            delete proposals[sender]
            conn.sendMessage(m.chat, { text: '⏳ Proposta di matrimonio scaduta.' })
        }
    }, 60000)
}

/* ================= 🔥 AMANTE ================= */
async function amante(m, conn, users, usedPrefix) {
    const sender = m.sender
    const target = m.mentionedJid?.[0] || m.quoted?.sender

    if (!target) throw `Usa: ${usedPrefix}amante @utente`
    if (target === sender) throw '❌ Non puoi essere amante di te stesso'
    if (!users[target]) users[target] = {}

    if (users[sender].amante)
        throw `🔥 *AMANTE GIÀ PRESENTE*

Il tuo amante:
${tagUser(users[sender].amante)}

Usa *.togliamante* prima.`

    if (users[target].amante)
        throw `🔥 *PERSONA GIÀ OCCUPATA*

${tagUser(target)} ha già un amante 😏`

    if (lovers[sender] || lovers[target])
        throw '⏳ C’è già una proposta amante in corso'

    lovers[target] = sender
    lovers[sender] = target

    await conn.sendMessage(m.chat, {
        text:
`🔥 *PROPOSTA DI AMANTE* 🔥

${tagUser(sender)} vuole che ${tagUser(target)} diventi il suo amante 😏

Rispondi:
✔️ *SI* per accettare  
❌ *NO* per rifiutare`,
        mentions: [sender, target]
    })

    setTimeout(() => {
        if (lovers[target]) {
            delete lovers[target]
            delete lovers[sender]
            conn.sendMessage(m.chat, { text: '⏳ Proposta amante scaduta.' })
        }
    }, 60000)
}

/* ================= ❌ TOGLI AMANTE ================= */
function togliAmante(m, users) {
    const user = users[m.sender]

    if (!user.amante)
        throw '❌ Non hai nessun amante'

    const ex = users[user.amante]
    const exJid = user.amante

    user.amante = null
    if (ex) ex.amante = null

    m.reply(`💔 Tu e ${tagUser(exJid)} non siete più amanti`, null, {
        mentions: [exJid]
    })
}

/* ================= 👨‍👩‍👧 ADOZIONE ================= */
async function adotta(m, conn, users, usedPrefix) {
    const sender = m.sender
    const target = m.mentionedJid?.[0] || m.quoted?.sender

    if (!target) throw `Usa: ${usedPrefix}adotta @utente`
    if (target === sender) throw '❌ Non puoi adottare te stesso'
    if (!users[target]) users[target] = {}

    if (users[target].genitori?.length)
        throw `👨‍👩‍👧 *ADOZIONE IMPOSSIBILE*

${tagUser(target)} ha già dei genitori.`

    adoptions[target] = sender

    await conn.sendMessage(m.chat, {
        text:
`👨‍👩‍👧 *RICHIESTA DI ADOZIONE*

${tagUser(sender)} vuole adottare ${tagUser(target)} 💖

Rispondi:
✔️ *SI* per accettare  
❌ *NO* per rifiutare`,
        mentions: [sender, target]
    })

    setTimeout(() => {
        if (adoptions[target]) {
            delete adoptions[target]
            conn.sendMessage(m.chat, { text: '⏳ Richiesta di adozione scaduta.' })
        }
    }, 60000)
}

/* ================= 📜 FAMIGLIA ================= */
function famiglia(m, users) {
    const user = users[m.sender]
    let txt = `👨‍👩‍👧 *FAMIGLIA DI ${tagUser(m.sender)}*\n\n`
    let mentions = [m.sender]

    txt += '💑 *Coniuge*\n'
    if (user.sposato && user.coniuge) {
        txt += `• ${tagUser(user.coniuge)}\n`
        mentions.push(user.coniuge)
    } else txt += '• Nessuno\n'

    txt += '\n🔥 *Amante*\n'
    if (user.amante) {
        txt += `• ${tagUser(user.amante)}\n`
        mentions.push(user.amante)
    } else txt += '• Nessuno\n'

    txt += '\n👤 *Genitori*\n'
    if (user.genitori?.length) {
        for (let g of user.genitori) {
            txt += `• ${tagUser(g)}\n`
            mentions.push(g)
        }
    } else txt += '• Nessuno\n'

    txt += '\n👶 *Figli*\n'
    if (user.figli?.length) {
        for (let f of user.figli) {
            txt += `• ${tagUser(f)}\n`
            mentions.push(f)
        }
    } else txt += '• Nessuno'

    m.reply(txt, null, { mentions })
}

/* ================= 💔 DIVORZIO ================= */
function divorzia(m, users) {
    const user = users[m.sender]
    if (!user.sposato) throw '❌ Non sei sposato'

    const ex = users[user.coniuge]

    user.sposato = false
    user.coniuge = null

    if (ex) {
        ex.sposato = false
        ex.coniuge = null
    }

    m.reply('💔 Matrimonio terminato. Ora siete divorziati.')
}

/* ================= 👶 TOGLI FIGLIO ================= */
function togliFiglio(m, users) {
    const sender = m.sender
    const target = m.mentionedJid?.[0] || m.quoted?.sender

    if (!target) throw 'Usa: .toglifiglio @figlio'

    const user = users[sender]
    const child = users[target]

    if (!user.figli || !user.figli.includes(target))
        throw '❌ Questa persona non è tuo figlio.'

    user.figli = user.figli.filter(f => f !== target)

    if (child?.genitori)
        child.genitori = child.genitori.filter(g => g !== sender)

    m.reply(
`🧾 *ADOZIONE REVOCATA*

👤 Genitore: ${tagUser(sender)}
👶 Figlio: ${tagUser(target)}

💔 Non fate più parte della stessa famiglia.`,
null,
{ mentions: [sender, target] })
}

/* ================= 🔒 CONFERME ================= */
handler.before = async (m, { conn }) => {
    if (!m.text) return
    const txt = m.text.toLowerCase().trim()
    const users = global.db.data.users

    if (proposals[m.sender]) {
        const from = proposals[m.sender]
        const to = m.sender

        if (txt === 'si' || txt === 'sì') {
            users[from].sposato = true
            users[from].coniuge = to
            users[to].sposato = true
            users[to].coniuge = from

            delete proposals[from]
            delete proposals[to]

            return conn.sendMessage(m.chat, {
                text: `💍 ${tagUser(from)} e ${tagUser(to)} ora sono sposati! 💖`,
                mentions: [from, to]
            })
        }

        if (txt === 'no') {
            delete proposals[from]
            delete proposals[to]
            return m.reply('❌ Proposta di matrimonio rifiutata')
        }
    }

    if (lovers[m.sender]) {
        const from = lovers[m.sender]
        const to = m.sender

        if (txt === 'si' || txt === 'sì') {
            users[from].amante = to
            users[to].amante = from

            delete lovers[from]
            delete lovers[to]

            return conn.sendMessage(m.chat, {
                text: `🔥 ${tagUser(from)} e ${tagUser(to)} ora sono amanti 😏`,
                mentions: [from, to]
            })
        }

        if (txt === 'no') {
            delete lovers[from]
            delete lovers[to]
            return m.reply('❌ Proposta amante rifiutata')
        }
    }

    if (adoptions[m.sender]) {
        const from = adoptions[m.sender]
        const to = m.sender

        if (txt === 'si' || txt === 'sì') {
            users[to].genitori = [from]
            users[from].figli = users[from].figli || []
            users[from].figli.push(to)

            delete adoptions[to]

            return conn.sendMessage(m.chat, {
                text: `👨‍👩‍👧 ${tagUser(from)} ha adottato ${tagUser(to)} 💖`,
                mentions: [from, to]
            })
        }

        if (txt === 'no') {
            delete adoptions[to]
            return m.reply('❌ Adozione rifiutata')
        }
    }
}

function tagUser(jid) {
    return '@' + jid.split('@')[0]
}

handler.command = ['sposa','divorzia','adotta','famiglia','toglifiglio','amante','togliamante']
handler.group = true

export default handler
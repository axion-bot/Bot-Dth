let handler = async (m, { conn }) => {
    let user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = {}
    let u = global.db.data.users[user]
    if (!u.euro) u.euro = 0

    let reward = Math.floor(Math.random() * 30) + 5
    u.euro += reward

    conn.reply(m.chat,
        `🙏 Qualcuno ti ha dato ${reward} €.\nTotale: ${u.euro} €`, m)
}

handler.command = /^beg|elemosina$/i
export default handler
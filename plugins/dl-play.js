import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚡ *𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓*\n\n💡 _Scrivi:_ ${usedPrefix + command} nome canzone`);

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼.*');

    if (vid.seconds > 1800) {
        return m.reply('🚫 *𝗙𝗶𝗹𝗲 𝘁𝗿𝗼𝗽𝗽𝗼 𝗴𝗿𝗮𝗻𝗱𝗲!* (Max 30 min)');
    }

    const url = vid.url;

    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━━┓\n`;
        infoMsg += `   🎧  *𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 𝐏𝐋𝐀𝐘𝐄𝐑* 🎧\n`;
        infoMsg += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n`;
        infoMsg += `◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n`;
        infoMsg += `◈ 👀 *𝗩𝗶𝗲𝘄𝘀:* ${vid.views.toLocaleString()}\n`;
        infoMsg += `◈ 📅 *𝗣𝘂𝗯𝗯𝗹𝗶𝗰𝗮𝘁𝗼:* ${vid.ago}\n\n`;
        infoMsg += `*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼 𝗱𝗮 𝘀𝗰𝗮𝗿𝗶𝗰𝗮𝗿𝗲:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: '𝚴𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 • 𝟤𝟢𝟤𝟨',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    let downloadUrl = null;
    const isAudio = command === 'playaud';

    try {
        let res = isAudio ? await fg.yta(url) : await fg.ytv(url);
        if (res && res.dl_url) downloadUrl = res.dl_url;
    } catch {
        try {
            let api = isAudio ? 'ytmp3' : 'ytmp4';
            let res = await fetch(`https://api.vreden.my.id/api/${api}?url=${url}`);
            let json = await res.json();
            downloadUrl = json.result?.download?.url;
        } catch {
            try {
                let res = await fetch(`https://api.siputzx.my.id/api/d/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${url}`);
                let json = await res.json();
                downloadUrl = isAudio ? json.data?.dl : json.data?.dl;
            } catch {
                throw new Error();
            }
        }
    }

    if (!downloadUrl) throw new Error();

    let resBuffer = await fetch(downloadUrl);
    let mediaBuffer = Buffer.from(await resBuffer.arrayBuffer());

    if (isAudio) {
        await conn.sendMessage(m.chat, {
            audio: mediaBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`,
            ptt: false
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, {
            video: mediaBuffer,
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓*\n🎬 _${vid.title}_`,
            fileName: `${vid.title}.mp4`
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
    m.reply('🚀 *𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 𝐄𝐑𝐑𝐎𝐑:* Server temporaneamente offline.');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid|canzone)$/i;

export default handler;

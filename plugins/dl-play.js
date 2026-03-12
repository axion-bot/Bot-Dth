import yts from "yt-search";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * VAREBOT PLAY PLUGIN - VPS EDITION
 * Made for: deadly
 */

/* ================= HELPERS ESTETICI ================= */
const decor = {
  head: "╔════════════════════╗",
  foot: "╚════════════════════╝",
  star: "⭐",
  music: "🎵",
  video: "🎬",
  time: "⏱️",
  views: "👁️",
  link: "🔗"
};

/* ================= FUNZIONE DOWNLOAD CORE ================= */
function downloadMedia(url, output, isAudio = true) {
  return new Promise((resolve, reject) => {
    // Usiamo --js-runtime quickjs come concordato per evitare i WARNING
    let args = [
      "--js-runtime", "quickjs",
      "--no-playlist",
      "--no-warnings",
      "-o", output,
      url
    ];

    if (isAudio) {
      args.splice(4, 0, "-f", "bestaudio", "--extract-audio", "--audio-format", "mp3", "--audio-quality", "0");
    } else {
      args.splice(4, 0, "-f", "best[ext=mp4]/best", "--merge-output-format", "mp4");
    }

    const proc = spawn("yt-dlp", args);
    
    let stderr = "";
    proc.stderr.on("data", (data) => stderr += data.toString());

    proc.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(stderr);
    });
  });
}

/* ================= HANDLER PRINCIPALE ================= */
const handler = async (m, { conn, text, command }) => {
  
  // 1. RICERCA E INVIO MENU (Comando principale: .play)
  if (command === "play") {
    if (!text) return m.reply(`❌ *Uso corretto:* .play <titolo o link>`);

    const search = await yts(text);
    const v = search.videos[0];
    if (!v) return m.reply("❌ Non ho trovato nulla su YouTube.");

    let caption = `      ${decor.head}\n`;
    caption += `  ${decor.star} *VAREBOT PLAYER* ${decor.star}\n`;
    caption += `      ${decor.foot}\n\n`;
    caption += `📝 *Titolo:* ${v.title}\n`;
    caption += `${decor.time} *Durata:* ${v.timestamp}\n`;
    caption += `${decor.views} *Views:* ${v.views.toLocaleString()}\n`;
    caption += `${decor.link} *Link:* ${v.url}\n\n`;
    caption += `*Scegli il formato che preferisci:*`;

    // Bottoni (Assicurati che la tua versione di Baileys/VareBot li supporti)
    return await conn.sendMessage(m.chat, {
      image: { url: v.thumbnail },
      caption: caption,
      footer: "Powered by yt-dlp & QuickJS",
      buttons: [
        { buttonId: `.playaudio ${v.url}`, buttonText: { displayText: `${decor.music} AUDIO MP3` }, type: 1 },
        { buttonId: `.playvideo ${v.url}`, buttonText: { displayText: `${decor.video} VIDEO MP4` }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m });
  }

  // 2. LOGICA DOWNLOAD (playaudio o playvideo)
  const isAudio = command.includes("audio");
  const url = text.trim();
  if (!url.startsWith("http")) return; // Ignora se non è un link passato dai bottoni

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  
  const tmpFile = path.join(os.tmpdir(), `vare_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

  try {
    await downloadMedia(url, tmpFile, isAudio);

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(tmpFile),
        mimetype: "audio/mpeg",
        fileName: `${Date.now()}.mp3`
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(tmpFile),
        mimetype: "video/mp4",
        caption: "✅ Ecco il tuo video!"
      }, { quoted: m });
    }
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error("ERRORE DOWNLOAD:", e);
    await conn.reply(m.chat, "❌ *Errore nel download!*\nYouTube potrebbe aver bloccato la richiesta. Prova tra poco.", m);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
  } finally {
    // Pulizia file temporaneo
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
};

handler.command = ["play", "playaudio", "playvideo"];
handler.tags = ["downloader"];
handler.help = ["play"];

export default handler;

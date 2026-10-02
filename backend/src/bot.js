import "dotenv/config";
import { supabase } from "./supabase.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log("TELEGRAM_BOT_TOKEN is empty. Bot is not started.");
  process.exit(0);
}

async function send(chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
  });
}

let offset = 0;
console.log("Telegram bot started.");
while (true) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates?timeout=25&offset=${offset}`);
    const json = await r.json();
    if (!json.ok) {
      console.error("Telegram API error:", json.description || json);
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }
    for (const u of json.result || []) {
      offset = u.update_id + 1;
      const chatId = String(u.message?.chat?.id || "");
      const text = u.message?.text || "";
      if (!chatId) continue;
      if (text.startsWith("/start") || text.startsWith("/help")) {
        await send(chatId, "Teacher Jobs UZ 👋\n\n/jobs — oxirgi vakansiyalar\n/profile — Telegram chat ID ni ko‘rish");
      } else if (text.startsWith("/profile")) {
        await send(chatId, `Sizning Telegram chat ID: ${chatId}\nUni profil bildirishnomalari uchun ishlatish mumkin.`);
      } else if (text.startsWith("/jobs")) {
        const { data } = await supabase.from("vacancies")
          .select("title,city,salary_text,source_url").eq("status","published")
          .order("published_at",{ascending:false, nullsFirst:false}).limit(5);
        const body = (data || []).map((v,i)=>`${i+1}. ${v.title}\n📍 ${v.city || "O‘zbekiston"}\n💰 ${v.salary_text || "Kelishiladi"}\n${v.source_url || ""}`).join("\n\n");
        await send(chatId, body || "Hozircha yangi vakansiya yo‘q.");
      } else {
        await send(chatId, "Buyruqlar: /jobs, /profile, /help");
      }
    }
  } catch (e) {
    console.error("Telegram polling error:", e.message);
    await new Promise(r => setTimeout(r, 3000));
  }
}

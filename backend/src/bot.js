import "dotenv/config";
import { supabase } from "./supabase.js";
import { mockVacancies } from "./data/mockVacancies.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";

// In-memory fallback subscribers map when DB table is not ready
const localSubscribers = new Set();

// Send message helper
export async function sendTelegramMessage(chatId, text, extra = {}) {
  if (!token) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...extra
      })
    });
    return await res.json();
  } catch (err) {
    console.error("Telegram send error:", err.message);
  }
}

// Format vacancy into a clean Telegram card
function formatVacancyCard(v) {
  const title = v.title || "Pedagogik vakansiya";
  const school = v.companies?.name || v.source_name || "Ta'lim muassasasi";
  const subject = v.subject || "Fan ko‘rsatilmagan";
  const city = v.city || "O‘zbekiston";
  const district = v.district ? `, ${v.district}` : "";
  const salary = v.salary_text || (v.salary_min ? `${Number(v.salary_min).toLocaleString()} so‘m+` : "Kelishiladi");
  const url = v.source_url || `${frontendUrl}/vacancies/${v.id}`;

  return (
    `💼 <b>${title}</b>\n` +
    `🏢 <i>${school}</i>\n` +
    `📚 Fan: <b>${subject}</b>\n` +
    `📍 Hudud: <b>${city}${district}</b>\n` +
    `💰 Maosh: <b>${salary}</b>\n\n` +
    `🔗 <a href="${url}">Batafsil ma'lumot va ariza topshirish ➔</a>`
  );
}

// Broadcast newly posted vacancy to all subscribers
export async function broadcastVacancy(v) {
  if (!token) return;

  // 1. Try fetching from Supabase telegram_subscriptions
  let chatIds = [];
  try {
    const { data } = await supabase
      .from("telegram_subscriptions")
      .select("telegram_chat_id")
      .eq("active", true);

    if (data && data.length) {
      chatIds = data.map(d => d.telegram_chat_id);
    }
  } catch {
    // ignore DB errors
  }

  // Add local subscribers
  for (const id of localSubscribers) {
    if (!chatIds.includes(id)) chatIds.push(id);
  }

  if (process.env.TELEGRAM_CHANNEL_ID) {
    chatIds.push(process.env.TELEGRAM_CHANNEL_ID);
  }

  if (!chatIds.length) return;

  const text = `🔔 <b>YANGI VAKANSIYA!</b>\n\n${formatVacancyCard(v)}`;
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: "🌐 Saytda to‘liq ko‘rish", url: v.source_url || `${frontendUrl}/vacancies/${v.id}` }]
    ]
  };

  for (const chatId of chatIds) {
    await sendTelegramMessage(chatId, text, { reply_markup: inlineKeyboard });
  }
}

// Main Menu Keyboard
const mainMenuKeyboard = {
  keyboard: [
    [{ text: "🔍 Barcha vakansiyalar" }, { text: "📚 Fanlar bo‘yicha" }],
    [{ text: "📍 Viloyatlar bo‘yicha" }, { text: "🔔 Obuna bo‘lish" }],
    [{ text: "👤 Profil / Chat ID" }, { text: "🌐 Veb-saytga o‘tish" }]
  ],
  resize_keyboard: true
};

const subjectsKeyboard = {
  keyboard: [
    [{ text: "📐 Matematika" }, { text: "⚡ Fizika" }],
    [{ text: "🧪 Kimyo" }, { text: "🧬 Biologiya" }],
    [{ text: "💻 Informatika va IT" }, { text: "🇬🇧 Ingliz tili" }],
    [{ text: "📖 Boshlang‘ich ta'lim" }, { text: "⬅️ Asosiy menyu" }]
  ],
  resize_keyboard: true
};

const citiesKeyboard = {
  keyboard: [
    [{ text: "🏙 Toshkent" }, { text: "🏛 Samarqand" }],
    [{ text: "🌲 Farg‘ona" }, { text: "🏺 Buxoro" }],
    [{ text: "🍎 Andijon" }, { text: "⬅️ Asosiy menyu" }]
  ],
  resize_keyboard: true
};

async function getVacancies(filter = {}) {
  try {
    let query = supabase.from("vacancies").select("*, companies(*)").eq("status", "published").limit(5);
    if (filter.subject) query = query.ilike("subject", `%${filter.subject}%`);
    if (filter.city) query = query.eq("city", filter.city);
    const { data, error } = await query;
    if (!error && data && data.length) return data;
  } catch {
    // fallback
  }

  // Fallback to mock data
  let result = [...mockVacancies];
  if (filter.subject) {
    const s = filter.subject.toLowerCase();
    result = result.filter(v => (v.subject || "").toLowerCase().includes(s) || v.title.toLowerCase().includes(s));
  }
  if (filter.city) {
    result = result.filter(v => v.city === filter.city);
  }
  return result.slice(0, 5);
}

// Bot polling loop
export async function startBot() {
  if (!token) {
    console.log("ℹ️ TELEGRAM_BOT_TOKEN kiritilmagan. Telegram bot ishga tushirilmadi.");
    console.log("💡 Botni ishga tushirish uchun @BotFather orqali token oling va backend/.env ga TELEGRAM_BOT_TOKEN=... qilib qo‘ying.");
    return;
  }

  let offset = 0;
  console.log("🚀 Teacher Jobs UZ Telegram boti muvaffaqiyatli ishga tushdi!");

  while (true) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates?timeout=25&offset=${offset}`);
      const json = await r.json();

      if (!json.ok) {
        console.error("Telegram API xatoligi:", json.description || json);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      for (const u of json.result || []) {
        offset = u.update_id + 1;
        const msg = u.message;
        if (!msg) continue;

        const chatId = String(msg.chat.id);
        const text = (msg.text || "").trim();

        if (text.startsWith("/start") || text === "⬅️ Asosiy menyu") {
          const welcome =
            `Assalomu alaykum, <b>${msg.from?.first_name || "Ustoz"}</b>!\n\n` +
            `<b>Teacher Jobs UZ</b> botiga xush kelibsiz. Bu yerda O‘zbekistondagi eng so‘nggi pedagogik vakansiyalarni qidirishingiz va yangi ish o‘rinlaridan birinchilardan bo‘lib xabardor bo‘lishingiz mumkin.\n\n` +
            `Quyidagi menyudan kerakli bo‘limni tanlang:`;
          await sendTelegramMessage(chatId, welcome, { reply_markup: mainMenuKeyboard });
        } else if (text === "🔍 Barcha vakansiyalar" || text === "/jobs") {
          const jobs = await getVacancies();
          if (!jobs.length) {
            await sendTelegramMessage(chatId, "Hozircha tizimda faol vakansiyalar mavjud emas.", { reply_markup: mainMenuKeyboard });
          } else {
            for (const j of jobs) {
              const inlineBtn = {
                inline_keyboard: [
                  [{ text: "🌐 Saytda to‘liq ko‘rish", url: j.source_url || `${frontendUrl}/vacancies/${j.id}` }]
                ]
              };
              await sendTelegramMessage(chatId, formatVacancyCard(j), { reply_markup: inlineBtn });
            }
          }
        } else if (text === "📚 Fanlar bo‘yicha") {
          await sendTelegramMessage(chatId, "Qaysi fan bo‘yicha vakansiyalarni ko‘rmoqchisiz? Fanni tanlang:", { reply_markup: subjectsKeyboard });
        } else if (
          text.includes("Matematika") ||
          text.includes("Fizika") ||
          text.includes("Kimyo") ||
          text.includes("Biologiya") ||
          text.includes("Informatika") ||
          text.includes("Ingliz tili") ||
          text.includes("Boshlang‘ich")
        ) {
          const cleanSubject = text.replace(/^[^\w\s\u0400-\u04FF]+/, "").trim();
          const jobs = await getVacancies({ subject: cleanSubject });
          if (!jobs.length) {
            await sendTelegramMessage(chatId, `<b>${cleanSubject}</b> fani bo‘yicha hozircha yangi vakansiya topilmadi.`, { reply_markup: subjectsKeyboard });
          } else {
            await sendTelegramMessage(chatId, `🎯 <b>${cleanSubject}</b> fani bo‘yicha topilgan vakansiyalar:`);
            for (const j of jobs) {
              const inlineBtn = {
                inline_keyboard: [
                  [{ text: "🌐 Saytda to‘liq ko‘rish", url: j.source_url || `${frontendUrl}/vacancies/${j.id}` }]
                ]
              };
              await sendTelegramMessage(chatId, formatVacancyCard(j), { reply_markup: inlineBtn });
            }
          }
        } else if (text === "📍 Viloyatlar bo‘yicha") {
          await sendTelegramMessage(chatId, "Qaysi viloyat / shahar bo‘yicha vakansiyalarni qidiryapsiz?", { reply_markup: citiesKeyboard });
        } else if (
          text.includes("Toshkent") ||
          text.includes("Samarqand") ||
          text.includes("Farg‘ona") ||
          text.includes("Buxoro") ||
          text.includes("Andijon")
        ) {
          const cleanCity = text.replace(/^[^\w\s\u0400-\u04FF]+/, "").trim();
          const jobs = await getVacancies({ city: cleanCity });
          if (!jobs.length) {
            await sendTelegramMessage(chatId, `<b>${cleanCity}</b> bo‘yicha hozircha vakansiyalar topilmadi.`, { reply_markup: citiesKeyboard });
          } else {
            await sendTelegramMessage(chatId, `📍 <b>${cleanCity}</b> bo‘yicha topilgan vakansiyalar:`);
            for (const j of jobs) {
              const inlineBtn = {
                inline_keyboard: [
                  [{ text: "🌐 Saytda to‘liq ko‘rish", url: j.source_url || `${frontendUrl}/vacancies/${j.id}` }]
                ]
              };
              await sendTelegramMessage(chatId, formatVacancyCard(j), { reply_markup: inlineBtn });
            }
          }
        } else if (text === "🔔 Obuna bo‘lish" || text === "/subscribe") {
          localSubscribers.add(chatId);
          try {
            await supabase.from("telegram_subscriptions").upsert({
              telegram_chat_id: chatId,
              active: true
            });
          } catch {
            // ignore DB errors
          }
          await sendTelegramMessage(
            chatId,
            `✅ <b>Siz bildirishnomalarga muvaffaqiyatli obuna bo‘ldingiz!</b>\n\n` +
            `Yangi o‘qituvchilik vakansiyalari e'lon qilinganda bot sizga avtomatik tarzda xabar yetkazadi.`,
            { reply_markup: mainMenuKeyboard }
          );
        } else if (text === "👤 Profil / Chat ID" || text === "/profile") {
          const isSubscribed = localSubscribers.has(chatId);
          await sendTelegramMessage(
            chatId,
            `👤 <b>Sizning ma'lumotlaringiz:</b>\n\n` +
            `🆔 <b>Telegram Chat ID:</b> <code>${chatId}</code>\n` +
            `🔔 <b>Obuna holati:</b> ${isSubscribed ? "Faol (Yoniq) ✅" : "O‘chiq ❌"}\n\n` +
            `Ushbu Chat ID orqali saytdagi profilingizga Telegram xabarnomalarini bog‘lashingiz mumkin.`,
            { reply_markup: mainMenuKeyboard }
          );
        } else if (text === "🌐 Veb-saytga o‘tish") {
          const inlineBtn = {
            inline_keyboard: [
              [{ text: "🚀 Teacher Jobs UZ Saytiga o‘tish", url: frontendUrl }]
            ]
          };
          await sendTelegramMessage(
            chatId,
            `Platformaning to‘liq imkoniyatlaridan (AI Matching, rezyume saqlash va vakansiya joylash) foydalanish uchun veb-saytimizga tashrif buyuring:`,
            { reply_markup: inlineBtn }
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `Kechirasiz, buyruq tushunarsiz.\nQuyidagi menyu tugmalaridan birini tanlang:`,
            { reply_markup: mainMenuKeyboard }
          );
        }
      }
    } catch (e) {
      console.error("Telegram polling error:", e.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// Auto-run if executed directly via CLI: `node src/bot.js`
if (process.argv[1]?.endsWith("bot.js")) {
  startBot();
}

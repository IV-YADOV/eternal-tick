import "dotenv/config";
import { Telegraf, Markup } from "telegraf";
import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN!);
const API = process.env.PUBLIC_APP_URL!;
const SHARED = process.env.BOT_SHARED_SECRET!;

bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});

bot.start(async (ctx) => {
  await ctx.reply("Привет! Нажми кнопку и поделись номером, чтобы войти:");
  await ctx.reply(
    "После этого пришлю кнопку «Открыть сайт», и ты сразу окажешься в личном кабинете.",
    Markup.keyboard([Markup.button.contactRequest("Поделиться номером 📱")])
      .oneTime()
      .resize()
  );
});

bot.on("contact", async (ctx) => {
  try {
    if (ctx.message.contact.user_id !== ctx.from!.id) {
      return ctx.reply("Нужен именно твой номер (кнопкой выше).");
    }

    const payload = {
      tgId: String(ctx.from!.id),
      phone: ctx.message.contact.phone_number,
      name: [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ") || undefined,
    };

    const { data } = await axios.post(`${API}/api/tg/auth/token`, payload, {
      headers: { "x-bot-secret": SHARED },
    });

    await ctx.reply("Готово! Жми, чтобы войти в личный кабинет:", {
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть сайт ▶️", url: data.deepLink }]],
      },
    });
  } catch (e: any) {
    console.error("contact error:", e?.response?.data || e);
    await ctx.reply("Не получилось войти. Попробуй ещё раз позже.");
  }
});

bot.launch().then(() => console.log("✅ Bot launched"));

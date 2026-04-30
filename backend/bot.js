const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Открыть маркет", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть",
            web_app: {
              url: "https://frontend-438e.onrender.com"
            }
          }
        ]
      ]
    }
  })
})
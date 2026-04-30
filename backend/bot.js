const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot('8689990118:AAHJnEiJH_4aGctJwGqEnDWTwWVmEhL_vw0', { polling: true })

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Открыть маркет", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть",
            web_app: {
              url: "https://woof-giddily-concrete.ngrok-free.dev"
            }
          }
        ]
      ]
    }
  })
})
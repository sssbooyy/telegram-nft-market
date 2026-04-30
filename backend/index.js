require('dotenv').config();

const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

app.use(cors());
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '8182287812';
const FRONTEND_URL = 'https://fronted-438e.onrender.com/';

let orders = [];

const gifts = [
  {
    id: 1,
    name: "Fresh Socks",
    number: 918,
    model: "Foundation",
    symbol: "Drug",
    backdrop: "Cobalt Blue",
    availability: "162 997/200 509",
    value: 165506,
    image: "https://i.imgur.com/1X6GQ7M.png",
    bgColor: "#5c6cff"
  },
  {
    id: 2,
    name: "Bling Binky",
    number: 918,
    model: "Regent",
    symbol: "Pomegranate",
    backdrop: "Burgundy",
    availability: "9 377/9 990",
    value: 1275373,
    image: "https://i.imgur.com/2mYwJYp.png",
    bgColor: "#8b4a4a"
  },
  {
    id: 3,
    name: "Input Key",
    number: 918,
    model: "Woodland",
    symbol: "Orchid",
    backdrop: "Chestnut",
    availability: "132 032/159 750",
    value: 514952,
    image: "https://i.imgur.com/3YkQw2R.png",
    bgColor: "#a0522d"
  },
  {
    id: 4,
    name: "Swag Bag",
    number: 918,
    model: "Rastafari",
    symbol: "Ice Cream",
    backdrop: "Pacific Cyan",
    availability: "231 724/237 970",
    value: 292070,
    image: "https://i.imgur.com/4ZkLmP3.png",
    bgColor: "#4db8ff"
  }
];

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Открыть маркет', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🛒 Открыть UZB Market',
            web_app: {
              url: FRONTEND_URL
            }
          }
        ]
      ]
    }
  });
});

bot.onText(/\/id/, (msg) => {
  bot.sendMessage(msg.chat.id, `Твой chat_id: ${msg.chat.id}`);
});

bot.onText(/\/testadmin/, async (msg) => {
  try {
    await bot.sendMessage(ADMIN_CHAT_ID, '✅ Тест админу работает');
    bot.sendMessage(msg.chat.id, 'Отправил админу ✅');
  } catch (error) {
    bot.sendMessage(msg.chat.id, `Ошибка: ${error.message}`);
  }
});

app.get('/', (req, res) => {
  res.send('Backend работает 🚀');
});

app.get('/gifts', (req, res) => {
  res.json(gifts);
});

app.get('/orders', (req, res) => {
  const userId = req.query.userId;

  if (userId) {
    const userOrders = orders.filter(order => order.buyer?.id == userId);
    return res.json(userOrders);
  }

  res.json(orders);
});

app.post('/orders', async (req, res) => {
  try {
    const { giftId, user } = req.body;

    const gift = gifts.find(g => g.id == giftId);

    if (!gift) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    const order = {
      id: Date.now(),
      giftId: gift.id,
      giftName: gift.name,
      giftNumber: gift.number,
      price: gift.price, 
      buyer: user || null,
      status: 'pending',
      createdAt: new Date()
    };

    orders.push(order);

    await bot.sendMessage(
      ADMIN_CHAT_ID,
      `🛒 Новый запрос на подарок!

🧾 Заказ: #${order.id}
👤 Покупатель: @${user?.username || 'не указан'}
🆔 Telegram ID: ${user?.id || 'не указан'}
🎁 Товар: ${order.giftName}
🔢 Номер: #${order.giftNumber}
💎 Цена: ${order.price.toLocaleString()} сум
📌 Статус: ${order.status}

Нужно вручную отправить подарок пользователю.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ Подарок отправлен',
                callback_data: `sent_${order.id}`
              }
            ]
          ]
        }
      }
    );

    res.json({
      success: true,
      message: 'Заказ создан и отправлен админу',
      order
    });

  } catch (error) {
    console.error('Ошибка заказа:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

bot.on('callback_query', async (query) => {
  const data = query.data;

  if (data.startsWith('sent_')) {
    const orderId = data.replace('sent_', '');
    const order = orders.find(o => o.id == orderId);

    if (!order) {
      return bot.answerCallbackQuery(query.id, {
        text: 'Заказ не найден'
      });
    }

    order.status = 'sent';

    await bot.answerCallbackQuery(query.id, {
      text: 'Статус обновлён: подарок отправлен ✅'
    });

    await bot.editMessageText(
      `✅ Подарок отправлен!

🧾 Заказ: #${order.id}
👤 Покупатель: @${order.buyer?.username || 'не указан'}
🆔 Telegram ID: ${order.buyer?.id || 'не указан'}
🎁 Товар: ${order.giftName}
🔢 Номер: #${order.giftNumber}
💎 Цена: ${order.price.toLocaleString()} сум
📌 Статус: sent`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      }
    );
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
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
    name: 'Golden Gift',
    number: 93201,
    price: 50000,
    collection: 'Premium',
    model: 'Gift',
    image: 'https://cdn-icons-png.flaticon.com/512/869/869636.png'
  },
  {
    id: 2,
    name: 'Diamond Gift',
    number: 48140,
    price: 120000,
    collection: 'Luxury',
    model: 'Diamond',
    image: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png'
  },
  {
    id: 3,
    name: 'Pool Float',
    number: 159426,
    price: 68300,
    collection: 'Summer',
    model: 'Float',
    image: 'https://cdn-icons-png.flaticon.com/512/616/616554.png'
  },
  {
    id: 4,
    name: 'Victory Medal',
    number: 88422,
    price: 20400,
    collection: 'Awards',
    model: 'Medal',
    image: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png'
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
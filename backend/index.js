require('dotenv').config();

const express = require('express');
const cors = require('cors');

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('8689990118:AAHJnEiJH_4aGctJwGqEnDWTwWVmEhL_vw0', { polling: false });
const ADMIN_CHAT_ID = '8182287812';

const app = express();


app.use(cors());
app.use(express.json());

let orders = [];

app.get('/', (req, res) => {
  res.send('Backend работает 🚀');
});

app.get('/gifts', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Golden Gift',
      price: 50000,
      image: 'https://cdn-icons-png.flaticon.com/512/869/869636.png'
    },
    {
      id: 2,
      name: 'Diamond Gift',
      price: 120000,
      image: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png'
    }
  ]);
});

app.post('/orders', (req, res) => {
  const { giftId, user } = req.body;

  const order = {
    id: Date.now(),
    giftId,
    buyer: user || null,
    status: 'pending',
    createdAt: new Date()
  };

  orders.push(order);

  res.json({
    success: true,
    message: 'Заказ создан, ожидает оплаты',
    order
  });
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/payment-success', async (req, res) => {
  try {
    const { orderId, username } = req.body;
    
    const order = orders.find(o => o.id == orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Заказ не найден' });
    }

    order.status = 'paid';

    const gifts = [
      { id: 1, name: 'NFT Gift 1', price: 50000 },
      { id: 2, name: 'NFT Gift 2', price: 120000 }
    ];

    const gift = gifts.find(g => g.id == order.giftId);

    await bot.sendMessage(
      ADMIN_CHAT_ID,
      `💰 Новый оплаченный заказ!

🧾 Заказ: #${order.id}
👤 Покупатель: ${username || 'не указан'}
🎁 Товар: ${gift?.name || order.giftId}
💵 Цена: ${gift?.price?.toLocaleString() || '-'} сум
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

    res.json({ success: true, message: 'Оплата подтверждена' });
  } catch (error) {
    console.error('Ошибка Telegram:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

bot.on('callback_query', async (query) => {
  const data = query.data;

  if (data.startsWith('sent_')) {
    const orderId = data.replace('sent_', '');
    const order = orders.find(o => o.id == orderId);

    if (order) {
      order.status = 'sent';

      await bot.answerCallbackQuery(query.id, {
        text: 'Статус обновлён: подарок отправлен ✅'
      });

      await bot.editMessageText(
        `✅ Подарок отправлен!

🧾 Заказ: #${order.id}
🎁 Gift ID: ${order.giftId}
📌 Статус: sent`,
        {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id
        }
      );
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
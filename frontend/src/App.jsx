import { useEffect, useState } from "react"
import axios from "axios"
import "./App.css"

const API = "https://nft-backend-zk0a.onrender.com"

function App() {
  const [gifts, setGifts] = useState([])
  const [selectedGift, setSelectedGift] = useState(null)
  const [order, setOrder] = useState(null)
  const [screen, setScreen] = useState("market")
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.Telegram?.WebApp?.ready()

    axios.get(`${API}/gifts`)
      .then(res => {
        setGifts(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      })
  }, [])

  const createOrder = async (gift) => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

    const res = await axios.post(`${API}/orders`, {
      giftId: gift.id,
      user: tgUser
    })

    setSelectedGift(gift)
    setOrder(res.data.order)
    setScreen("payment")
    setMessage("")
  }

  const confirmPayment = async () => {
    if (!username.trim()) {
      setMessage("Введите Telegram username")
      return
    }

    const cleanUsername = username.trim().startsWith("@")
      ? username.trim()
      : "@" + username.trim()

    await axios.post(`${API}/payment-success`, {
      orderId: order.id,
      username: cleanUsername
    })

    setMessage("Оплата подтверждена ✅ Админ получил заказ и скоро отправит подарок.")
    setScreen("success")
  }

  const resetMarket = () => {
    setScreen("market")
    setOrder(null)
    setSelectedGift(null)
    setUsername("")
    setMessage("")
  }

  return (
    <div className="app">
      <header className="header">
        <p className="badge">Telegram NFT Gifts</p>
        <h1>NFT Market</h1>
        <p className="subtitle">
          Покупай Telegram-подарки через Humo / Uzcard
        </p>
      </header>

      {message && screen !== "success" && (
        <div className="notice">{message}</div>
      )}

      {screen === "market" && (
        <>
          {loading ? (
            <section className="grid">
              {[1, 2].map(i => (
                <div className="card skeleton" key={i}>
                  <div className="skeletonCircle"></div>
                  <div className="skeletonLine"></div>
                  <div className="skeletonLine small"></div>
                </div>
              ))}
            </section>
          ) : (
            <section className="grid">
              {gifts.map(g => (
                <div className="card" key={g.id}>
                  <div className="giftEmoji">🎁</div>
                  <h3>{g.name}</h3>
                  <p className="price">{g.price.toLocaleString()} сум</p>
                  <p className="muted">Цифровой Telegram NFT-подарок</p>
                  <button onClick={() => createOrder(g)}>Купить</button>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {screen === "payment" && selectedGift && order && (
        <div className="card">
          <button className="backBtn" onClick={() => setScreen("market")}>
            ← Назад
          </button>

          <h2>Оплата заказа</h2>

          <div className="giftEmoji bigEmoji">🎁</div>

          <div className="paymentBox">
            <p><b>Товар:</b> {selectedGift.name}</p>
            <p><b>Сумма:</b> {selectedGift.price.toLocaleString()} сум</p>
            <p><b>Номер заказа:</b> #{order.id}</p>
          </div>

          <div className="paymentBox">
            <h3>Способ оплаты</h3>
            <p>Humo / Uzcard</p>
            <p className="muted">
              После оплаты админ получит уведомление и отправит подарок вручную.
            </p>
          </div>

          <div className="paymentBox">
            <h3>Ваш Telegram username</h3>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
            />
            <p className="muted">
              Админ отправит подарок на этот Telegram.
            </p>
          </div>

          <button onClick={confirmPayment}>Я оплатил</button>
        </div>
      )}

      {screen === "success" && (
        <div className="card success">
          <div className="successIcon">✅</div>
          <h2>Заказ принят</h2>
          <p>{message}</p>
          <button onClick={resetMarket}>
            Вернуться в магазин
          </button>
        </div>
      )}
    </div>
  )
}

export default App
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://nft-backend-zk0a.onrender.com";

export default function App() {
  const [gifts, setGifts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("store");

  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  useEffect(() => {
    tg?.expand();
    axios.get(`${API_URL}/gifts`).then((res) => setGifts(res.data));
  }, []);

  const filtered = gifts.filter((gift) =>
    gift.name.toLowerCase().includes(search.toLowerCase())
  );

  const buyGift = async (giftId) => {
    await axios.post(`${API_URL}/orders`, {
      giftId,
      user: {
        id: user?.id,
        username: user?.username,
        first_name: user?.first_name,
      },
    });

    alert("Заказ отправлен админу ✅");
    setSelected(null);
  };

  return (
    <div className="app">
      <header className="top">
      <div className="logo">🇺🇿 UZB Market</div>
        <div className="menu">•••</div>
      </header>

      <div className="balance">
        <div>⭐ 0</div>
        <div>💎 0 TON</div>
      </div>

      <div className="banner">
        <div>
          <h1>3 collections</h1>
          <p>Cashback 50%</p>
        </div>
        <div className="banner-icons">🎒 🥇 🔥</div>
      </div>

      <nav className="tabs">
        <button
          className={tab === "store" ? "active" : ""}
          onClick={() => setTab("store")}
        >
          All items
        </button>
        <button
          className={tab === "collections" ? "active" : ""}
          onClick={() => setTab("collections")}
        >
          Collections
        </button>
      </nav>

      {tab === "store" && (
        <>
          <input
            className="search"
            placeholder="🔍 Quick find"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filters">
            <button>Filter</button>
            <button>Sort</button>
            <button>Collection</button>
            <button>Model</button>
          </div>

          <div className="grid">
            {filtered.map((gift) => (
              <div className="card" key={gift.id} onClick={() => setSelected(gift)}>
              <div
                className="imageBox"
                style={{ background: gift.bgColor }}
              >
                <img src={gift.image} />
              </div>
            
              <h2>{gift.name} #{gift.number}</h2>
              <p>{gift.model}</p>
            
              <button>{gift.value.toLocaleString()} сум</button>
            </div>
            ))}
          </div>
        </>
      )}

      {tab === "collections" && (
        <div className="empty">
          <h2>Collections</h2>
          <p>Скоро тут будут коллекции подарков.</p>
        </div>
      )}

      <footer className="bottom">
        <button>🎮<span>Games</span></button>
        <button className="selected">🛍<span>Store</span></button>
        <button>🎁<span>My gifts</span></button>
        <button>✨<span>Season</span></button>
      </footer>

      {selected && (
        <div className="modal">
          <div className="modalContent" style={{ background: selected.bgColor }}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <img src={selected.image} />

            <h1>{selected.name} #{selected.number}</h1>
            <p>{selected.model}</p>

            <div className="info">
              <div><b>Owner:</b> Abat ⭐</div>
              <div><b>Model:</b> {selected.model}</div>
              <div><b>Symbol:</b> {selected.symbol}</div>
              <div><b>Backdrop:</b> {selected.backdrop}</div>
              <div><b>Availability:</b> {selected.availability}</div>
              <div><b>Value:</b> {selected.value.toLocaleString()} сум</div>
          </div>

          <button className="buy" onClick={() => buyGift(selected.id)}>
            Request gift
          </button>
        </div>
        </div>
      )}
    </div>
  );
}
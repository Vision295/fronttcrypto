import React, { useState, useEffect } from 'react';
// Import cryptocurrency logos
import bitcoin from './bitcoinBTC.png';
import ethereum from './ethereumETH.png';
import binancecoin from './binancecoinBNB.png';
import avalanche from './avalancheAVAX.png';
import cardano from './cardanoADA.png';
import dogecoin from './dogecoinDOGE.png';
import litecoin from './litecoinLTC.png';
import polkadot from './polkadotDOT.png';
import shibainu from './shibainuSHIB.png';
import solana from './solanaSOL.png';
import xrp from './xrpXRP.png';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import './App.css';

const ip = process.env.REACT_APP_SERVER_IP || "localhost"; // Use environment variable or default to localhost
const port = 5000;
const API_BASE_URL = `http://${ip}:${port}`;

// Define crypto images mapping
const cryptoImages = {
  SHIB: shibainu,
  DOGE: dogecoin,
  LTC: litecoin,
  ADA: cardano,
  DOT: polkadot,
  SOL: solana,
  AVAX: avalanche,
  BNB: binancecoin,
  XRP: xrp,
  ETH: ethereum,
  BTC: bitcoin,
};

// Define crypto full names
const cryptoFullNames = {
  SHIB: "Shiba Inu",
  DOGE: "Dogecoin",
  LTC: "Litecoin",
  ADA: "Cardano",
  DOT: "Polkadot",
  SOL: "Solana",
  AVAX: "Avalanche",
  BNB: "Binance Coin",
  XRP: "XRP",
  ETH: "Ethereum",
  BTC: "Bitcoin",
};

// Define crypto unlock order
const cryptoUnlockOrder = ["SHIB", "DOGE", "LTC", "ADA", "DOT", "SOL", "AVAX", "BNB", "XRP", "ETH", "BTC"];

function App() {
  // User state
  const [USD, setUSD] = useState(1000000);
  const [maxUSD, setMaxUSD] = useState(1000000); // Initialiser maxUSD avec la même valeur que USD
  const [username, setUsername] = useState(""); // Nouveau state pour le pseudo
  const [isUsernameSet, setIsUsernameSet] = useState(false); // Vérifie si le pseudo est défini

  const [BTC, setBTC] = useState(0);
  const [ETH, setETH] = useState(0);
  const [BNB, setBNB] = useState(0);
  const [TCR, setTCR] = useState(0);
  const [cps, setCps] = useState({ BTC: 0, ETH: 0, BNB: 0, TCR: 0 }); // Crypto per second for each crypto

  // Shop and market states
  const [availableCryptos, setAvailableCryptos] = useState(['Tcrypto']); // Initially only Tcrypto is available
  const [shopItems, setShopItems] = useState({
    Tcrypto: [
      { name: 'ASIC Miner', cost: 10, count: 0, bps: 0.001 },
      { name: 'GPU Miner', cost: 100, count: 0, bps: 0.004 },
    ],
    BinanceCoin: [
      { name: 'ASIC Miner', cost: 20, count: 0, bps: 0.002 },
      { name: 'GPU Miner', cost: 200, count: 0, bps: 0.008 },
    ],
    Ethereum: [
      { name: 'ASIC Miner', cost: 30, count: 0, bps: 0.003 },
      { name: 'GPU Miner', cost: 300, count: 0, bps: 0.012 },
    ],
    Bitcoin: [
      { name: 'ASIC Miner', cost: 40, count: 0, bps: 0.004 },
      { name: 'GPU Miner', cost: 400, count: 0, bps: 0.016 },
    ],
  });

  // Animation states
  const [buttonAnimation, setButtonAnimation] = useState({});
  
  // Price history for charts
  const [priceHistory, setPriceHistory] = useState(() => {
    const history = {};
    Object.keys(cryptoPrices).forEach(crypto => {
      history[crypto] = Array(20).fill(cryptoPrices[crypto]);
    });
    return history;
  });

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [buyOrSell, setBuyOrSell] = useState('buy');
  
  // Leaderboard data
  const [userData, setUserData] = useState([]);
  const [userRank, setUserRank] = useState(null);

  // Get the next unlockable cryptocurrency
  const getNextUnlockableCrypto = () => {
    const nextIndex = cryptoUnlockOrder.findIndex(crypto => !availableCryptos.includes(crypto));
    return nextIndex !== -1 ? cryptoUnlockOrder[nextIndex] : null;
  };

  // Increment crypto balances based on production per second
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoBalances(prev => {
        const newBalances = { ...prev };
        Object.keys(cps).forEach(crypto => {
          newBalances[crypto] = prev[crypto] + cps[crypto];
        });
        return newBalances;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cps]);

  // Update USD based on crypto production value
  useEffect(() => {
    const interval = setInterval(() => {
      setUSD(prevUSD => {
        let earnedUSD = 0;
        Object.keys(cps).forEach(crypto => {
          earnedUSD += cps[crypto] * cryptoPrices[crypto];
        });
        const newUSD = prevUSD + earnedUSD;
        // Update maxUSD if current balance is higher
        setMaxUSD(prevMax => Math.max(prevMax, newUSD));
        return newUSD;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cps, cryptoPrices]);

  // Simulate price fluctuations for cryptos
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        Object.keys(newPrices).forEach(crypto => {
          // Create realistic fluctuations based on coin value
          const volatilityFactor = crypto === 'BTC' ? 0.02 : 
                                  crypto === 'ETH' ? 0.025 : 
                                  crypto === 'SHIB' ? 0.04 : 0.03;
          
          const change = 0.98 + Math.random() * volatilityFactor * 2;
          newPrices[crypto] = parseFloat((prevPrices[crypto] * change).toFixed(6));
        });
        return newPrices;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUSD((prevUSD) => {
        // Calculez uniquement les gains basés sur les cryptos produits
        const earnedUSD = cps.BTC * cryptoPrices.BTC + cps.ETH * cryptoPrices.ETH + cps.BNB * cryptoPrices.BNB + cps.TCR * cryptoPrices.TCR;
        return prevUSD + earnedUSD; // Ajoutez les gains au solde existant
      });
    }, 1000); // Mise à jour toutes les secondes
    return () => clearInterval(interval);
  }, [cps, cryptoPrices]); // Dépend uniquement de `cps` et `cryptoPrices`

  // Handle username submission
  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true);

      // Update leaderboard immediately
      fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, score: maxUSD }),
      })
        .then(() => {
          // Refresh leaderboard data
          fetch(`${API_BASE_URL}/api/users`)
            .then(response => response.json())
            .then(data => setUserData(data))
            .catch(error => console.error("Error fetching leaderboard data:", error));
        })
        .catch(error => console.error("Error updating score:", error));
    }
  };

  // Handle clicking on a crypto to manually mine
  const handleCryptoClick = (crypto) => {
    setCryptoBalances(prev => ({
      ...prev,
      [crypto]: prev[crypto] + 1
    }));
  };

  // Handle unlocking a new cryptocurrency
  const handleUnlockCrypto = (crypto) => {
    const unlockCost = cryptoPrices[crypto] * 1000; // Cost to unlock
    if (USD >= unlockCost) {
      setUSD(prev => prev - unlockCost);
      setAvailableCryptos(prev => [...prev, crypto]);
    }
  };

  // Handle buying an item from the shop
  const handleBuyItem = (crypto, index) => {
    const items = shopItems[crypto];
    const item = items[index];

    if (USD >= item.cost) {
      setUSD(prev => prev - item.cost);
      
      // Update shop items
      setShopItems(prev => {
        const newShopItems = { ...prev };
        const newItems = [...prev[crypto]];
        newItems[index] = {
          ...item,
          count: item.count + 1,
          cost: Math.round(item.cost * 1.15), // 15% cost increase
        };
        newShopItems[crypto] = newItems;
        return newShopItems;
      });

      // Update CPS
      setCps(prev => ({
        ...prev,
        [crypto]: prev[crypto] + item.bps,
      }));

      // Trigger animation for the buy button
      setButtonAnimation(prev => ({ ...prev, [`buy-${crypto}-${index}`]: true }));
      setTimeout(() => setButtonAnimation(prev => ({ ...prev, [`buy-${crypto}-${index}`]: false })), 300);
    }
  };

  // Handle selling a crypto
  const handleSellCrypto = (crypto) => {
    const balances = { BTC, ETH, BNB, TCR };
    const setBalance = { BTC: setBTC, ETH: setETH, BNB: setBNB, TCR: setTCR }[crypto];
    if (balances[crypto] > 0) {
      const sellAmount = balances[crypto];
      setBalance(0); // Réinitialisez le solde de la crypto
      const usdGained = sellAmount * cryptoPrices[crypto];
      setUSD((prev) => {
        const newUSD = prev + usdGained;
        setMaxUSD((prevMax) => Math.max(prevMax, newUSD)); // Mettez à jour maxUSD uniquement lors de la vente
        return newUSD;
      });

      // Animation pour le bouton de vente
      setButtonAnimation((prev) => ({ ...prev, [`sell-${crypto}`]: true }));
      setTimeout(() => setButtonAnimation((prev) => ({ ...prev, [`sell-${crypto}`]: false })), 300);
    }
  };

  const renderGraph = (crypto) => {
    const data = {
      labels: priceHistory[crypto]?.map((_, index) => index + 1),
      datasets: [
        {
          label: `${crypto} Price`,
          data: priceHistory[crypto],
          segment: {
            borderColor: (ctx) => {
              const { p0, p1 } = ctx;
              return p1.raw > p0.raw ? '#069506' : '#c22929';
            },
          },
          pointBackgroundColor: '#d3d3d3',
          borderWidth: 2,
          backgroundColor: 'rgba(6, 149, 6, 0.1)',
          fill: true,
          tension: 0.1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#069506' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#069506' }
        },
      },
      plugins: {
        legend: { labels: { color: '#069506' } }
      }
    };

    return (
      <div key={crypto} className="chart-container">
        <h3>{cryptoFullNames[crypto]} (${cryptoPrices[crypto].toFixed(6)})</h3>
        <Line data={data} options={options} />
        <div className="chart-buttons">
          <button
            className={buttonAnimation[`sell-${crypto}`] ? 'button-animation' : ''}
            onClick={() => handleSellCryptoPopup(crypto)}
          >
            Sell {crypto}
          </button>
          <button
            className={buttonAnimation[`buy-${crypto}`] ? 'button-animation' : ''}
            onClick={() => handleBuyCryptoPopup(crypto)}
          >
            Buy {crypto}
          </button>
        </div>
      </div>
    );
  };

  // Filter users for leaderboard display
  const getLeaderboardUsers = () => {
    if (!userData || userData.length === 0) return [];
    
    const result = [];
    
    // Add top 3
    for (let i = 0; i < Math.min(3, userData.length); i++) {
      result.push(userData[i]);
    }
    
    // Add 3 above and 3 below current user if not in top 3
    if (userRank && userRank > 3) {
      result.push({ name: "...", score: 0, separator: true });
      
      const start = Math.max(3, userRank - 3);
      const end = Math.min(userRank + 3, userData.length);
      
      for (let i = start; i < end; i++) {
        result.push(userData[i]);
      }
    }
    
    return result;
  };

  // Render username screen
  if (!isUsernameSet) {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="UsernameTitle">Welcome to</h1>
          <h1 className="UsernameTitle2">Crypto Miner</h1>
          <h1 className="Ask-username">Enter your username</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="pixel-input"
          />
          <button onClick={handleUsernameSubmit}>Start</button>
        </header>
      </div>
    );
  }

  // Get next unlockable crypto
  const nextCrypto = getNextUnlockableCrypto();

  return (
    <div className="App">
      <div className="App-main">
        <h1>Crypto Market Simulator</h1>
        
        {/* Balance information */}
        <div className="balances-container">
          <div className="balance-item">
            <p>USD Balance: ${USD.toFixed(2)}</p>
            <p>Max USD Balance: ${maxUSD.toFixed(2)}</p>
          </div>
          
          {/* Crypto balances */}
          <div className="crypto-balances">
            {availableCryptos.map(crypto => (
              <div key={crypto} className="balance-item">
                <p>{crypto} Balance: {cryptoBalances[crypto].toFixed(6)} {crypto}</p>
                <p>Per second: {cps[crypto].toFixed(6)} {crypto}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Clickable crypto logos */}
        <div className="Crypto-container">
          {availableCryptos.map(crypto => (
            <img
              key={crypto}
              src={cryptoImages[crypto]}
              className="Crypto-logo"
              alt={crypto}
              onClick={() => handleCryptoClick(crypto)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar with shop */}
      <div className="App-sidebar">
        <h2>Shop</h2>
        
        {/* Next unlockable crypto */}
        {nextCrypto && (
          <div className="shop-item">
            <p>Unlock {cryptoFullNames[nextCrypto]}</p>
            <button onClick={() => handleUnlockCrypto(nextCrypto)}>
              ${(cryptoPrices[nextCrypto] * 1000).toFixed(2)}
            </button>
          </div>
        )}
        
        {/* Display miners for available cryptos */}
        {availableCryptos.map(crypto => (
          <div key={crypto}>
            <h3>{cryptoFullNames[crypto]} Miners</h3>
            {shopItems[crypto].map((item, index) => (
              <div key={index} className="shop-item">
                <p>{item.name}</p>
                <p>Cost: ${item.cost.toFixed(2)}</p>
                <p>Count: {item.count}</p>
                <p>BPS: {item.bps.toFixed(6)}</p>
                <button
                  className={buttonAnimation[`buy-${crypto}-${index}`] ? 'button-animation' : ''}
                  onClick={() => handleBuyItem(crypto, index)}
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Vertical line divider */}
      <div className="vertical-line">
        {Array(24).fill('+').map((plus, index) => (
          <p key={index}>{plus}</p>
        ))}
      </div>

      {/* Crypto market charts */}
      <div className="App-currencies">
        <h2>Crypto-Market</h2>
        {availableCryptos.map(crypto => renderChart(crypto))}
      </div>

      {/* Leaderboard */}
      <div className="App-leaderboard">
        <h2 className="LdTitle">Leaderboard</h2>
        {getLeaderboardUsers().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th className="LdRank">Rank</th>
                <th className="LdName">Name</th>
                <th className="LdScore">Score</th>
              </tr>
            </thead>
            <tbody>
              {getLeaderboardUsers().map((user, index) => (
                user.separator ? (
                  <tr key="separator">
                    <td colSpan="3">...</td>
                  </tr>
                ) : (
                  <tr key={index} className={user.name === username ? 'current-user' : ''}>
                    <td>{userData.indexOf(user) + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.score.toFixed(2)}</td> {/* Limite à 2 chiffres après la virgule */}
                  </tr>
                )
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading leaderboard data...</p>
        )}
      </div>

      {/* Buy/Sell Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{buyOrSell === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}</h3>
            <p>Price per unit: ${cryptoPrices[selectedCrypto].toFixed(6)}</p>
            <input
              type="number"
              value={cryptoAmount}
              onChange={(e) => handleCryptoAmountChange(Number(e.target.value))}
              placeholder={`Enter amount to ${buyOrSell}`}
            />
            {buyOrSell === 'buy' ? (
              <p>
                ${USD.toFixed(2)} - ${(cryptoAmount * cryptoPrices[selectedCrypto]).toFixed(2)} = $
                {(USD - cryptoAmount * cryptoPrices[selectedCrypto]).toFixed(2)}
              </p>
            ) : (
              <p>
                ${USD.toFixed(2)} + ${(cryptoAmount * cryptoPrices[selectedCrypto]).toFixed(2)} = $
                {(USD + cryptoAmount * cryptoPrices[selectedCrypto]).toFixed(2)}
              </p>
            )}
            <div className="popup-buttons">
              <button onClick={handleConfirmTransaction}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
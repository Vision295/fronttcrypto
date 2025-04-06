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

// API configuration
const ip = "localhost";
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
  const [USD, setUSD] = useState(1);
  const [maxUSD, setMaxUSD] = useState(1);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  
  // Crypto balances state
  const [cryptoBalances, setCryptoBalances] = useState({
    SHIB: 0,
    DOGE: 0,
    LTC: 0,
    ADA: 0,
    DOT: 0,
    SOL: 0,
    AVAX: 0,
    BNB: 0,
    XRP: 0,
    ETH: 0,
    BTC: 0,
  });
  
  // Crypto generation per second state
  const [cps, setCps] = useState({
    SHIB: 0,
    DOGE: 0,
    LTC: 0,
    ADA: 0,
    DOT: 0,
    SOL: 0,
    AVAX: 0,
    BNB: 0,
    XRP: 0,
    ETH: 0,
    BTC: 0,
  });

  // Shop and marketplace states
  const [availableCryptos, setAvailableCryptos] = useState(['SHIB']);  // Start with SHIB
  const [cryptoPrices, setCryptoPrices] = useState({
    SHIB: 0.00001,
    DOGE: 0.06,
    LTC: 70,
    ADA: 0.4,
    DOT: 5,
    SOL: 20,
    AVAX: 15,
    BNB: 300,
    XRP: 0.5,
    ETH: 2000,
    BTC: 30000,
  });
  
  // Ajout du state pour le shop sélectionné
  const [selectedShopCrypto, setSelectedShopCrypto] = useState('SHIB'); // Crypto par défaut pour le shop
  
  // Shop items configuration avec meilleur équilibrage
  const [shopItems, setShopItems] = useState(() => {
    const items = {};
    Object.keys(cryptoFullNames).forEach(crypto => {
      // Coefficient basé sur la valeur de la crypto
      let valueCoefficient = Math.log10(Math.max(1, cryptoPrices[crypto] * 1000));
      if (valueCoefficient < 0.1) valueCoefficient = 0.1; // Minimum coefficient

      // Base cost différente selon la rareté de la crypto
      let baseCost = cryptoPrices[crypto] * 100 * valueCoefficient;
      if (baseCost < 0.01) baseCost = 0.01; // Minimum cost

      items[crypto] = [
        { 
          name: 'Basic Miner', 
          cost: baseCost, 
          count: 0, 
          bps: 0.002 * valueCoefficient
        },
        { 
          name: 'Standard Rig', 
          cost: baseCost * 5, 
          count: 0, 
          bps: 0.01 * valueCoefficient 
        },
        { 
          name: 'Advanced Rig', 
          cost: baseCost * 20, 
          count: 0, 
          bps: 0.05 * valueCoefficient 
        },
        { 
          name: 'Mining Farm', 
          cost: baseCost * 100, 
          count: 0, 
          bps: 0.25 * valueCoefficient 
        },
        { 
          name: 'Quantum Miner', 
          cost: baseCost * 500, 
          count: 0, 
          bps: 1.5 * valueCoefficient 
        }
      ];
    });
    return items;
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

  // show leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Get the next unlockable cryptocurrency
  const getNextUnlockableCrypto = () => {
    const nextIndex = cryptoUnlockOrder.findIndex(crypto => !availableCryptos.includes(crypto));
    return nextIndex !== -1 ? cryptoUnlockOrder[nextIndex] : null;
  };

  const [selectedCryptoForShop, setSelectedCryptoForShop] = useState(null);

  const handleCryptoLogoClick = (crypto) => {
    setSelectedCryptoForShop(crypto);
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

  // Update crypto prices for market
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/crypto-prices`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const prices = await response.json();
        setCryptoPrices(prices);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };
  
    // Fetch prices every 5 seconds
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update price history for charts
  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/price-history`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const history = await response.json();
        setPriceHistory(history);
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };
  
    // Fetch price history every 5 seconds
    fetchPriceHistory();
    const interval = setInterval(fetchPriceHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user data for leaderboard
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Sort data by score in descending order
        const sortedData = data.sort((a, b) => b.score - a.score);
        
        // Find current user's rank
        const userIndex = sortedData.findIndex(user => user.name === username);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
        
        setUserData(sortedData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isUsernameSet) {
      // Fetch data every 2 seconds
      const interval = setInterval(fetchUserData, 2000);
      return () => clearInterval(interval);
    }
  }, [isUsernameSet, username]);

  // Update server with user's score
  useEffect(() => {
    const updateUserScore = async () => {
      if (isUsernameSet && username) {
        try {
          await fetch(`${API_BASE_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: username, score: maxUSD }),
          });
        } catch (error) {
          console.error("Error updating score:", error);
        }
      }
    };

    // Update score every 5 seconds
    const interval = setInterval(updateUserScore, 5000);
    return () => clearInterval(interval);
  }, [isUsernameSet, username, maxUSD]);

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

  // Show popup for buying crypto
  const handleBuyCryptoPopup = (crypto) => {
    setSelectedCrypto(crypto);
    setCryptoAmount(0); // Reset the input field
    setBuyOrSell('buy');
    setShowPopup(true);
  };

  // Show popup for selling crypto
  const handleSellCryptoPopup = (crypto) => {
    setSelectedCrypto(crypto);
    setCryptoAmount(cryptoBalances[crypto]); // Default to selling all
    setBuyOrSell('sell');
    setShowPopup(true);
  };

  // Handle crypto amount change in popup
  const handleCryptoAmountChange = (value) => {
    if (buyOrSell === 'buy') {
      const cryptoPrice = cryptoPrices[selectedCrypto];
      const maxAffordable = Math.floor(USD / cryptoPrice);
      setCryptoAmount(Math.min(Math.max(0, value), maxAffordable));
    } else {
      setCryptoAmount(Math.min(Math.max(0, value), cryptoBalances[selectedCrypto]));
    }
  };

  // Confirm crypto transaction
  const handleConfirmTransaction = () => {
    if (cryptoAmount <= 0) {
      setShowPopup(false);
      return;
    }

    const cryptoPrice = cryptoPrices[selectedCrypto];
    
    if (buyOrSell === 'buy') {
      const totalCost = cryptoAmount * cryptoPrice;
      setUSD(prev => prev - totalCost);
      setCryptoBalances(prev => ({
        ...prev,
        [selectedCrypto]: prev[selectedCrypto] + cryptoAmount
      }));
    } else {
      const totalGain = cryptoAmount * cryptoPrice;
      setUSD(prev => {
        const newUSD = prev + totalGain;
        setMaxUSD(prevMax => Math.max(prevMax, newUSD));
        return newUSD;
      });
      setCryptoBalances(prev => ({
        ...prev,
        [selectedCrypto]: prev[selectedCrypto] - cryptoAmount
      }));
    }

    setShowPopup(false);
  };

  // Render crypto price chart
  const renderChart = (crypto) => {
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

         
            <form onSubmit={(e) => {
            e.preventDefault(); // prevent page reload
            handleUsernameSubmit();
            }}>
              <div className="Title-container">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="pixel-input"
              />
              <button className="Title-button" onClick={handleUsernameSubmit}>Start</button>
              </div>
          </form>

          


        </header>
      </div>
    );
  }

  // Get next unlockable crypto
  const nextCrypto = getNextUnlockableCrypto();

  return (
    <div className="App">
      {!showLeaderboard && (
        <div className="App-main">
          <h1>Crypto Market Simulator</h1>
          
          {/* Balance information */}
          <div className="balances-container">
            <div className="balance-item1">
              <p>USD Balance: ${USD.toFixed(2)}</p>
              <p>Max USD Balance: ${maxUSD.toFixed(2)}</p>
            </div>
            
            {/* Crypto balances */}
            <div className="crypto-balances">
              {availableCryptos.map(crypto => (
                <div key={crypto} className={`balance-item ${selectedCryptoForShop === crypto ? 'highlighted' : ''}`}>
                  <div className="balance-text">
                    <p>{crypto} Balance: {cryptoBalances[crypto].toFixed(6)}</p>
                    <p>{crypto} Per second: {cps[crypto].toFixed(6)}</p>
                  </div>
                  <div className="Crypto-container">
                    <img
                      key={crypto}  
                      src={cryptoImages[crypto]}
                      className="Crypto-logo"
                      alt={crypto}
                      onClick={() => {
                        handleCryptoClick(crypto);
                        handleCryptoLogoClick(crypto); // Highlight the clicked crypto
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          

        </div>
      )}

      {/* Sidebar with shop */}
      <div className="App-sidebar">
        <h2>Mining Shop</h2>
        
        {/* Next unlockable crypto */}
        {nextCrypto && (
          <div className="shop-item">
            <p>Unlock {cryptoFullNames[nextCrypto]}</p>
            <button onClick={() => handleUnlockCrypto(nextCrypto)}>
              ${(cryptoPrices[nextCrypto] * 1000).toFixed(2)}
            </button>
          </div>
        )}
        
        {/* Crypto selector */}
        <div className="crypto-selector">
          <label htmlFor="crypto-select">Select Cryptocurrency:</label>
          <select 
            id="crypto-select" 
            value={selectedShopCrypto} 
            onChange={(e) => setSelectedShopCrypto(e.target.value)}
          >
            {availableCryptos.map(crypto => (
              <option key={crypto} value={crypto}>
                {cryptoFullNames[crypto]} ({crypto})
              </option>
            ))}
          </select>
        </div>
        
        {/* Display miners for selected crypto only */}
        <div className="miners-container">
          <h3>{cryptoFullNames[selectedShopCrypto]} Miners</h3>
          {shopItems[selectedShopCrypto].map((item, index) => (
            <div key={index} className="shop-item">
              <p>{item.name}</p>
              <p>Cost: ${item.cost.toFixed(2)}</p>
              <p>Count: {item.count}</p>
              <p>{selectedShopCrypto} per sec: {item.bps.toFixed(6)}</p>
              <button
                className={buttonAnimation[`buy-${selectedShopCrypto}-${index}`] ? 'button-animation' : ''}
                onClick={() => handleBuyItem(selectedShopCrypto, index)}
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Crypto market charts */}
      <div className="App-currencies">
        <h2>Crypto-Market</h2>
        {availableCryptos.map(crypto => renderChart(crypto))}
      </div>
      
      {/* Leaderboard button */}
      <button class="vertical-button" onClick={() => setShowLeaderboard(prev => !prev)}>
        {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
      </button>

      {showLeaderboard && (
        <div className="leaderboard-title">
          <h1>Crypto Market Simulator</h1>
        </div>
      )}
      {/* Leaderboard */}
      {showLeaderboard && (
        
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
                      <td>${user.score.toFixed(2)}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          ) : (
            <p>Loading leaderboard data...</p>
          )}
        </div>
      )}

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
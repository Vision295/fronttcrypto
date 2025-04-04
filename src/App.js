import React, { useState, useEffect } from 'react';
import bitcoin from './bitcoin1.png';
import ethereum from './ethereum1.png';
import binance from './binance1.png';
import tcrypto from './tcrypto1.png';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import './App.css';

const ip = "localhost";
const port = 5000;
const API_BASE_URL = `http://${ip}:${port}`; // Revert back to localhost

function App() {
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
  const [clickAnimation, setClickAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ top: 0, left: 0 });
  const [buttonAnimation, setButtonAnimation] = useState({}); // State to track button animations

  // Increment crypto balances based on production per second
  useEffect(() => {
    const interval = setInterval(() => {
      setBTC(prev => prev + cps.BTC);
      setETH(prev => prev + cps.ETH);
      setBNB(prev => prev + cps.BNB);
      setTCR(prev => prev + cps.TCR);
    }, 1000);
    return () => clearInterval(interval);
  }, [cps]); // Ensure this effect runs whenever `cps` changes

  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: 30000,
    ETH: 2000,
    BNB: 300,
    TCR: 1,
  });

  const [priceHistory, setPriceHistory] = useState({
    BTC: [],
    ETH: [],
    BNB: [],
    TCR: [],
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/crypto-prices`);
        const prices = await response.json();

        setPriceHistory((prev) => {
          const updatedHistory = { ...prev };
          Object.keys(prices).forEach((crypto) => {
            const newHistory = [...(prev[crypto] || []), prices[crypto]];
            updatedHistory[crypto] = newHistory.slice(-20); // Keep only the last 20 points
          });
          return updatedHistory;
        });

        setCryptoPrices(prices);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    const interval = setInterval(fetchPrices, 5000); // Fetch prices every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Simulate price fluctuations for cryptos every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices(prevPrices => ({
        BTC: parseFloat((prevPrices.BTC * (0.98 + Math.random() * 0.04)).toFixed(2)),
        ETH: parseFloat((prevPrices.ETH * (0.98 + Math.random() * 0.04)).toFixed(2)),
        BNB: parseFloat((prevPrices.BNB * (0.98 + Math.random() * 0.04)).toFixed(2)),
        TCR: parseFloat((prevPrices.TCR * (0.98 + Math.random() * 0.04)).toFixed(2)),
      }));
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

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true);

      // Mise à jour immédiate du leaderboard
      fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, score: maxUSD }),
      })
        .then(() => {
          // Rafraîchir les données du leaderboard après mise à jour
          fetch(`${API_BASE_URL}/api/users`)
            .then(response => response.json())
            .then(data => setUserData(data))
            .catch(error => console.error("Error fetching leaderboard data:", error));
        })
        .catch(error => console.error("Error updating score:", error));
    }
  };

  // Handle click event for a crypto logo
  const handleCryptoClick = (crypto, event) => {
    const setBalance = { BTC: setBTC, ETH: setETH, BNB: setBNB, TCR: setTCR }[crypto];
    setBalance(prev => prev + 1);

    // Get the bounding rectangle of the image
    const rect = event.target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Generate random position around the logo
    const minRadius = rect.width / 2 + 20;
    const maxRadius = 150;
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomRadius = Math.random() * (maxRadius - minRadius) + minRadius;
    const randomTop = centerY + Math.sin(randomAngle) * randomRadius;
    const randomLeft = centerX + Math.cos(randomAngle) * randomRadius;

    setAnimationPosition({ top: randomTop, left: randomLeft });
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 300);
  };

  // Handle buying a crypto from the shop
  const handleBuyCrypto = (crypto) => {
    if (USD >= 1000) { // Example cost to unlock a crypto
      setUSD(prev => prev - 1000);
      setAvailableCryptos(prev => [...prev, crypto]);
    }
  };

  // Used in the next function to map the full crypto name to the short version to actually increase the CPS
  const cryptoMap = {
    Tcrypto: "TCR",
    BinanceCoin: "BNB",
    Ethereum: "ETH",
    Bitcoin: "BTC"
  };

  const handleBuyItem = (crypto, index) => {
    const cryptoKey = cryptoMap[crypto]; // Convertir en BTC, ETH, BNB, TCR
    if (!cryptoKey) return; // Sécurité

    const items = shopItems[crypto];
    const item = items[index];

    if (USD >= item.cost) {
      setUSD(prev => prev - item.cost);
      const newItems = [...items];
      newItems[index] = {
        ...item,
        count: item.count + 1,
        cost: item.cost * 2,
      };
      setShopItems(prev => ({ ...prev, [crypto]: newItems }));

      // Mettre à jour correctement le CPS
      setCps(prev => ({
        ...prev,
        [cryptoKey]: prev[cryptoKey] + item.bps,
      }));

      // Trigger animation for the buy button
      setButtonAnimation((prev) => ({ ...prev, [`buy-${crypto}-${index}`]: true }));
      setTimeout(() => setButtonAnimation((prev) => ({ ...prev, [`buy-${crypto}-${index}`]: false })), 300);
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
      labels: priceHistory[crypto]?.map((_, index) => index + 1), // Use indices as labels
      datasets: [
        {
          label: `${crypto} Price`,
          data: priceHistory[crypto],
          segment: {
            borderColor: (ctx) => {
              const { p0, p1 } = ctx;
              return p1.raw > p0.raw ? 'green' : 'red'; // Green for upward, red for downward
            },
          },
          pointBackgroundColor: '#d3d3d3', // Unified white/gray color for all points
          borderWidth: 2,
          backgroundColor: '#ffffff', // White background for the chart
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false, // Remove grid lines on the x-axis
          },
        },
        y: {
          grid: {
            display: false, // Remove grid lines on the y-axis
          },
        },
      },
    };

    return (
      <div key={crypto} className="chart-container">
        <Line data={data} options={options} />
        <div className="chart-buttons">
          <button
            className={buttonAnimation[`sell-${crypto}`] ? 'button-animation' : ''}
            onClick={() => handleSellCrypto(crypto)}
          >
            Sell All {crypto}
          </button>
          <button onClick={() => handleBuyCryptoPopup(crypto)}>Buy {crypto}</button>
        </div>
      </div>
    );
  };

  const [userData, setUserData] = useState([]); // State to store fetched user data
  const [currencyData, setCurrencyData] = useState([]); // State to store fetched currency data

  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [selectedCrypto, setSelectedCrypto] = useState(null); // State to track selected crypto
  const [cryptoAmount, setCryptoAmount] = useState(0); // State to track entered amount

  const handleBuyCryptoPopup = (crypto) => {
    setSelectedCrypto(crypto);
    setCryptoAmount(0); // Reset the input field
    setShowPopup(true); // Show the popup
  };

  const handleCryptoAmountChange = (value) => {
    const cryptoPrice = cryptoPrices[selectedCrypto];
    const maxAffordable = Math.floor(USD / cryptoPrice); // Calculate the maximum affordable amount
    setCryptoAmount(Math.min(value, maxAffordable)); // Set the amount, ensuring it doesn't exceed the maximum
  };

  const handleConfirmBuyCrypto = () => {
    if (cryptoAmount > 0) {
      const cryptoPrice = cryptoPrices[selectedCrypto];
      const totalCost = cryptoAmount * cryptoPrice;

      setUSD((prev) => prev - totalCost); // Deduct the cost from USD balance
      const setBalance = { BTC: setBTC, ETH: setETH, BNB: setBNB, TCR: setTCR }[selectedCrypto];
      setBalance((prev) => prev + cryptoAmount); // Add the purchased crypto to the balance
      setShowPopup(false); // Close the popup
    }
  };

  const handleCancelBuyCrypto = () => {
    setShowPopup(false); // Close the popup without making a purchase
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Trier les données par score décroissant avant de les afficher
        const sortedData = data.sort((a, b) => b.score - a.score);
        setUserData((prevData) => {
          // Comparer les anciennes et nouvelles données pour éviter un rendu inutile
          if (JSON.stringify(prevData) !== JSON.stringify(sortedData)) {
            return sortedData;
          }
          return prevData;
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch data every 500ms
    const interval = setInterval(fetchUserData, 500);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/currencies`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCurrencyData(data);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    // Fetch data every 500ms
    const interval = setInterval(fetchCurrencyData, 500);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  if (!isUsernameSet) {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className = "UsernameTitle">Welcome to</h1>
          <h1 className = "UsernameTitle2">TCrypto</h1>

            <h1 className = "Ask-username">Enter your username</h1>
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

  return (
    <div className="App">
        <div className="App-main">

          <h1>Crypto Market Simulator</h1>
          <div className="balances">
            <p>USD Balance: ${USD.toFixed(2)}</p>
            <p>Max USD Balance: ${maxUSD.toFixed(2)}</p> {/* Affiche le score maximum */}
            <p>BTC Balance: {BTC.toFixed(6)} BTC (per second: {cps.BTC.toFixed(6)})</p>
            <p>ETH Balance: {ETH.toFixed(6)} ETH (per second: {cps.ETH.toFixed(6)})</p>
            <p>BNB Balance: {BNB.toFixed(6)} BNB (per second: {cps.BNB.toFixed(6)})</p>
            <p>TCR Balance: {TCR.toFixed(6)} TCR (per second: {cps.TCR.toFixed(6)})</p>
          </div>
          <div className="Crypto-container">
            {availableCryptos.includes('Bitcoin') && (
              <img
                src={bitcoin}
                className="Crypto-logo"
                alt="Bitcoin"
                onClick={(e) => handleCryptoClick('BTC', e)}
              />
            )}
            {availableCryptos.includes('Ethereum') && (
              <img
                src={ethereum}
                className="Crypto-logo"
                alt="Ethereum"
                onClick={(e) => handleCryptoClick('ETH', e)}
              />
            )}
            {availableCryptos.includes('BinanceCoin') && (
              <img
                src={binance}
                className="Crypto-logo"
                alt="BinanceCoin"
                onClick={(e) => handleCryptoClick('BNB', e)}
              />
            )}
            {availableCryptos.includes('Tcrypto') && (
              <img
                src={tcrypto}
                className="Crypto-logo"
                alt="Tcrypto"
                onClick={(e) => handleCryptoClick('TCR', e)}
              />
            )}
            {clickAnimation && (
              <span
                className="Click-animation"
                style={{
                  top: `${animationPosition.top}px`,
                  left: `${animationPosition.left}px`,
                }}
              >
                +1
              </span>
            )}
          </div>
        </div>
    
      <header className="App-header">
        <div className="App-sidebar">
          <h2>Shop</h2>
          {['Tcrypto', 'BinanceCoin', 'Ethereum', 'Bitcoin'].map(crypto => (
            !availableCryptos.includes(crypto) ? (
              <div key={crypto} className="shop-item">
                <p>{crypto}</p>
                <button onClick={() => handleBuyCrypto(crypto)}>Unlock {crypto} ($1000)</button>
              </div>
            ) : (
              <div key={crypto}>
                <h3>{crypto} Shop</h3>
                {shopItems[crypto].map((item, index) => (
                  <div key={index} className="shop-item">
                    <p>{item.name}</p>
                    <p>Cost: ${item.cost.toFixed(2)}</p>
                    <p>Count: {item.count}</p>
                    <p>BPS: {item.bps}</p>
                    <button
                      className={buttonAnimation[`buy-${crypto}-${index}`] ? 'button-animation' : ''}
                      onClick={() => handleBuyItem(crypto, index)}
                    >
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            )
          ))}
        </div>

        <div class="vertical-line">
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>  
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>  
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>
        <p>+</p>

        </div>    


      


        <div className="App-currencies">
          <h2>Crypto-Market</h2>
          {['TCR', 'BNB', 'ETH', 'BTC'].map((crypto) => renderGraph(crypto))}
        </div>

        <div className="App-leaderboard">
          <h2 className = "LdTitle">Leaderboard</h2>
          {userData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th className="LdName">Name</th>
                  <th className="LdScore">Score</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.score.toFixed(2)}</td> {/* Limite à 2 chiffres après la virgule */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available.</p>
          )}
        </div>
      </header>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Buy {selectedCrypto}</h3>
            <p>Price per unit: ${cryptoPrices[selectedCrypto]}</p>
            <input
              type="number"
              value={cryptoAmount}
              onChange={(e) => handleCryptoAmountChange(Number(e.target.value))}
              placeholder="Enter amount"
            />
            <p>
              ${USD.toFixed(2)} - ${cryptoAmount * cryptoPrices[selectedCrypto]} = $
              {(USD - cryptoAmount * cryptoPrices[selectedCrypto]).toFixed(2)}
            </p>
            <div className="popup-buttons">
              <button onClick={handleConfirmBuyCrypto}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import bitcoin from './bitcoin1.png';
import ethereum from './ethereum1.png';
import binance from './binance1.png';
import tcrypto from './tcrypto1.png';
import './App.css';

const ip = "10.56.106.143";
const port = 5000;
const API_BASE_URL = `http://${ip}:${port}`; // Revert back to localhost

function App() {
  const [USD, setUSD] = useState(1000000);
  const [maxUSD, setMaxUSD] = useState(10000); // Nouveau state pour le score maximum
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
      setMaxUSD(prevMax => Math.max(prevMax, USD)); // Met à jour le score maximum
      if (isUsernameSet) {
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
    }, 10000); // Mise à jour toutes les 10 secondes
    return () => clearInterval(interval);
  }, [USD, maxUSD, username, isUsernameSet]);

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
    }
  };

  // Handle selling a crypto
  const handleSellCrypto = (crypto) => {
    const balances = { BTC, ETH, BNB, TCR };
    const setBalance = { BTC: setBTC, ETH: setETH, BNB: setBNB, TCR: setTCR }[crypto];
    if (balances[crypto] > 0) {
      const sellAmount = balances[crypto];
      setBalance(0); // Reset the crypto balance
      setUSD(prev => prev + sellAmount * cryptoPrices[crypto]); // Add USD equivalent
    }
  };

  const [userData, setUserData] = useState([]); // State to store fetched user data
  const [currencyData, setCurrencyData] = useState([]); // State to store fetched currency data

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
          <h1>Enter your username</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
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
                    <button onClick={() => handleBuyItem(crypto, index)}>Buy</button>
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


      


        <div className="App-market">

          {['BTC', 'ETH', 'BNB', 'TCR'].map(crypto => (
            availableCryptos.includes(crypto) && (
              <div key={crypto} className="market-item">
                <p>{crypto} Price: ${cryptoPrices[crypto].toFixed(2)}</p>
                <p>{crypto} per second: {cps[crypto].toFixed(6)}</p>
                <button onClick={() => handleSellCrypto(crypto)}>Sell All {crypto}</button>
              </div>
            )
          ))}
        </div>

        <div className="App-leaderboard">
          <h2>Leaderboard</h2>
          {userData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available.</p>
          )}
        </div>
        <div className="App-currencies">
          <h2>Crypto-Market</h2>
          {currencyData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Value</th>
                  <th>Total</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {currencyData.map((currency, index) => (
                  <tr key={index}>
                    <td>{currency.name}</td>
                    <td>{currency.value}</td>
                    <td>{currency.total}</td>
                    <td>{currency.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available.</p>
          )}
        </div>
      </header>
    </div>
  );
}



export default App;

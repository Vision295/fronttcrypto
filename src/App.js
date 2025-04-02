import React, { useState, useEffect } from 'react';

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
import terraclassic from './terraclassicLUNC.png';
import tetherusdt from './tetherusdtUSDT.png';
import xrp from './xrpXRP.png';

import './App.css';

const ip = "localhost";
const port = 5000;
const API_BASE_URL = `http://${ip}:${port}`; // Revert back to localhost

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

function App() {
  const [USD, setUSD] = useState(1000000);
  const [maxUSD, setMaxUSD] = useState(10000);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);

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

  const [availableCryptos, setAvailableCryptos] = useState(['SHIB']); // Start with SHIB
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

  const cryptoMap = {
    shibainuSHIB: "SHIB",
    dogecoinDOGE: "DOGE",
    litecoinLTC: "LTC",
    cardanoADA: "ADA",
    polkadotDOT: "DOT",
    solanaSOL: "SOL",
    avalancheAVAX: "AVAX",
    binancecoinBNB: "BNB",
    xrpXRP: "XRP",
    ethereumETH: "ETH",
    bitcoinBTC: "BTC",
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
      setBalance(0); // Reset the crypto balance
      const usdGained = sellAmount * cryptoPrices[crypto];
      setUSD((prev) => {
        const newUSD = prev + usdGained;
        setMaxUSD((prevMax) => Math.max(prevMax, newUSD)); // Update max USD balance
        return newUSD;
      });

      // Trigger animation for the sell button
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
          <p>Max USD Balance: ${maxUSD.toFixed(2)}</p>
          {Object.keys(cps).map((crypto) => (
            availableCryptos.includes(crypto) && (
              <p key={crypto}>
                {crypto} Balance: {cps[crypto].toFixed(6)} {crypto} (per second: {cps[crypto].toFixed(6)})
              </p>
            )
          ))}
        </div>
        <div className="Crypto-container">
          {Object.keys(cryptoImages).map((crypto) => (
            availableCryptos.includes(crypto) && (
              <img
                key={crypto}
                src={cryptoImages[crypto]}
                className="Crypto-logo"
                alt={crypto}
                onClick={() => handleCryptoClick(crypto)}
              />
            )
          ))}
        </div>
      </div>
      <header className="App-header">
        <div className="App-sidebar">
          <h2>Shop</h2>
          {Object.keys(cryptoImages).map((crypto) => (
            !availableCryptos.includes(crypto) && (
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
                    <td>{user.score}</td>
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

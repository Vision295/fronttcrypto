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

const API_BASE_URL = 'http://localhost:5000'; // Revert back to localhost

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

  const handleBuyCrypto = (crypto) => {
    const unlockCost = cryptoPrices[crypto] * 1000; // Example cost to unlock
    if (USD >= unlockCost) {
      setUSD((prev) => prev - unlockCost);
      setAvailableCryptos((prev) => [...prev, crypto]);
    }
  };

  const handleCryptoClick = (crypto) => {
    setCps((prev) => ({
      ...prev,
      [crypto]: prev[crypto] + 1,
    }));
  };

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
                <button onClick={() => handleBuyCrypto(crypto)}>
                  Unlock {crypto} (${(cryptoPrices[crypto] * 1000).toFixed(2)})
                </button>
              </div>
            )
          ))}
        </div>
        <div className="App-market">
          <h2>Crypto Market</h2>
          {Object.keys(cryptoImages).map((crypto) => (
            availableCryptos.includes(crypto) && (
              <div key={crypto} className="market-item">
                <p>{crypto} Price: ${cryptoPrices[crypto].toFixed(2)}</p>
                <p>{crypto} per second: {cps[crypto]?.toFixed(6) || 0}</p>
              </div>
            )
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;

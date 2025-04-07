// Importation des bibliothèques et composants nécessaires
import React, { useState, useEffect } from 'react';

// Importation des logos des cryptomonnaies
// Ces images sont utilisées pour représenter visuellement chaque cryptomonnaie.
import shibainu from './shibainuSHIB.png';
import dogecoin from './dogecoinDOGE.png';
import cardano from './cardanoADA.png';
import xrp from './xrpXRP.png';
import polkadot from './polkadotDOT.png';
import avalanche from './avalancheAVAX.png';
import solana from './solanaSOL.png';
import litecoin from './litecoinLTC.png';
import binancecoin from './binancecoinBNB.png';
import ethereum from './ethereumETH.png';
import bitcoin from './bitcoinBTC.png';

// Importation de Chart.js et du composant Line pour afficher les graphiques
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Importation de la configuration automatique de Chart.js
import './App.css';

// Configuration de l'API
// Définition de l'adresse IP et du port pour communiquer avec le backend.
const ip = "localhost";
const port = 5000;
const API_BASE_URL = `http://${ip}:${port}`;

// Mapping des images des cryptomonnaies
// Permet d'associer chaque symbole de cryptomonnaie à son image correspondante.
const cryptoImages = {
  SHIB: shibainu,
  DOGE: dogecoin,
  ADA: cardano,
  XRP: xrp,
  DOT: polkadot,
  AVAX: avalanche,
  SOL: solana,
  LTC: litecoin,
  BNB: binancecoin,
  ETH: ethereum,
  BTC: bitcoin,
};

// Noms complets des cryptomonnaies
// Fournit une description textuelle pour chaque symbole de cryptomonnaie.
const cryptoFullNames = {
  SHIB: "Shiba Inu",
  DOGE: "Dogecoin",
  ADA: "Cardano",
  XRP: "XRP",
  DOT: "Polkadot",
  AVAX: "Avalanche",
  SOL: "Solana",
  LTC: "Litecoin",
  BNB: "Binance Coin",
  ETH: "Ethereum",
  BTC: "Bitcoin",
};

// Descriptions des cryptomonnaies
// Fournit une brève explication de chaque cryptomonnaie.
const cryptoDescriptions = {
  SHIB: "Jeton même qui a gagné en popularité en 2021.",
  DOGE: "Cryptomonnaie même originale créée comme une blague.",
  ADA: "Plateforme blockchain proof-of-stake basée sur la recherche académique.",
  XRP: "Protocole de paiement numérique et cryptomonnaie.",
  DOT: "Protocole multi-chaînes connectant différentes blockchains.",
  AVAX: "Plateforme pour les réseaux blockchain personnalisés et les applications décentralisées.",
  SOL: "Blockchain haute performance prenant en charge les contrats intelligents.",
  LTC: "Alternative rapide à Bitcoin, souvent appelée l'argent numérique.",
  BNB: "Jeton utilitaire pour l'écosystème de la plateforme Binance.",
  ETH: "Plateforme de calcul décentralisée avec des contrats intelligents.",
  BTC: "Première cryptomonnaie et la plus grande par capitalisation boursière.",
};

// Ordre de déblocage des cryptomonnaies
// Définit l'ordre dans lequel les cryptomonnaies peuvent être débloquées.
const cryptoUnlockOrder = ["SHIB", "DOGE", "ADA", "XRP", "DOT", "AVAX", "SOL", "LTC", "BNB", "ETH", "BTC"];

// Coef crypto
const cryptoPrices = {
  SHIB: 0.00001,
  DOGE: 0.06,
  ADA: 0.4,
  XRP: 0.5,
  DOT: 5,
  AVAX: 15,
  SOL: 20,
  LTC: 70,
  BNB: 300,
  ETH: 2000,
  BTC: 30000,
};

function App() {
  // État utilisateur
  // `USD` représente le solde en dollars de l'utilisateur.
  const init_balance = 10000; // Solde initial en USD
  const [USD, setUSD] = useState(init_balance);
  const [maxUSD, setMaxUSD] = useState(init_balance); // Solde maximum atteint
  const [username, setUsername] = useState(""); // Nom d'utilisateur
  const [isUsernameSet, setIsUsernameSet] = useState(false); // Indique si le nom d'utilisateur est défini
  
  // État des soldes des cryptomonnaies
  // Stocke la quantité de chaque cryptomonnaie possédée par l'utilisateur.
  const [cryptoBalances, setCryptoBalances] = useState({
    SHIB: 0,
    DOGE: 0,
    ADA: 0,
    XRP: 0,
    DOT: 0,
    AVAX: 0,
    SOL: 0,
    LTC: 0,
    BNB: 0,
    ETH: 0,
    BTC: 0,
  });
  
  // État de la production par seconde (CPS) des cryptomonnaies
  // Définit combien de chaque cryptomonnaie est généré par seconde.
  const [cps, setCps] = useState({
    SHIB: 0,
    DOGE: 0,
    ADA: 0,
    XRP: 0,
    DOT: 0,
    AVAX: 0,
    SOL: 0,
    LTC: 0,
    BNB: 0,
    ETH: 0,
    BTC: 0,
  });

  // Liste des cypto-monnaies actuellement disponibles
  // SHIB est déjà debloqué au départ
  const [availableCryptos, setAvailableCryptos] = useState(['SHIB']);  

  // État pour la cryptomonnaie sélectionnée dans la boutique
  const [selectedShopCrypto, setSelectedShopCrypto] = useState('SHIB'); // Par défaut SHIB
  
  // Configuration des articles de la boutique
  // Chaque cryptomonnaie a une liste d'articles avec des coûts et des bénéfices spécifiques.
  const [shopItems, setShopItems] = useState(() => {
    const items = {};
    Object.keys(cryptoFullNames).forEach(crypto => {
      // Calcul du coefficient basé sur la valeur de la cryptomonnaie
      let valueCoefficient = (7 - Math.log10(cryptoPrices[crypto])) * 100;
      if (valueCoefficient < 1) valueCoefficient = 1; // Coefficient minimum

      // Définition du coût de base selon la rareté de la cryptomonnaie
      let baseCost = cryptoPrices[crypto] * 100;
      if (baseCost < 0.02) baseCost = 0.02; // Coût minimum

      items[crypto] = [
        { 
          name: 'Basic Miner', 
          cost: baseCost, 
          count: 0, 
          bps: 0.002 * valueCoefficient // Production par seconde
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

  // État pour l'animation des boutons
  const [buttonAnimation, setButtonAnimation] = useState({});
  
  // Historique des prix pour les graphiques
  // Stocke les prix passés de chaque cryptomonnaie pour afficher les graphiques.
  const [priceHistory, setPriceHistory] = useState(() => {
    const history = {};
    Object.keys(cryptoPrices).forEach(crypto => {
      history[crypto] = Array(20).fill(cryptoPrices[crypto]);
    });
    console.log('Initial priceHistory:', history);
    return history;
  });

  // Achat/Vente de crypto dans la popup
  const [showPopup, setShowPopup] = useState(false); // Bool qui détermine si la popup de vente est visible
  const [selectedCrypto, setSelectedCrypto] = useState(null); // Crypto sélectionnée pour buy/sell dans la popup
  const [cryptoAmount, setCryptoAmount] = useState(0); // Quantité de crypto entrée pour buy/sell dans la popup
  const [buyOrSell, setBuyOrSell] = useState('buy'); // L'action de la popup est buy or sell
  
  // Leaderboard
  const [userData, setUserData] = useState([]); // Liste des utilisateurs du leaderboard (rangé en desc order plus tard)
  const [userRank, setUserRank] = useState(null); // Rang actuel de l'utilisateur
  const [showLeaderboard, setShowLeaderboard] = useState(false); // Bool qui détermine si le leaderboard est visible

  // Débloque la crypto suivante
  // Utilise availableCryptos (liste des cypto-monnaies actuellement disponibles, il y a seulement SHIB au départ)
  // Utilise cryptoUnlockOrder (crypto-monnaies dans l'ordre de déblocage)
  // Renvoie la prochaine crypto-monnaie à débloquer ou null si toutes sont déjà débloquées
  const getNextUnlockableCrypto = () => {
    const nextIndex = cryptoUnlockOrder.findIndex(crypto => !availableCryptos.includes(crypto));
    return nextIndex !== -1 ? cryptoUnlockOrder[nextIndex] : null;
  };

  // Highlight la crypto-monnaie sélectionnée dans le shop
  const [selectedCryptoForShop, setSelectedCryptoForShop] = useState(null);


  // Fin des useState, début des useEffect


  // Fonction pour update la crypto-monnaie sélectionnée dans le shop
  // Utilisée pour highlight la crypto-monnaie cliquée
  const handleCryptoLogoClick = (crypto) => {
    setSelectedCryptoForShop(crypto);
  };



  /* Fonctionnement de useEffect :
    Hook qui permet d'exécuter du code en réponse à des changements

    Structure de base : 
        useEffect(() => {
      // Code à exécuter (effet)
      return () => {
        // Code de nettoyage (optionnel)
      };
    }, [dépendances]);

    S'il n'y a pas de dépendances, l'effet s'exécute à chaque rendu
    S'il y a des dépendances, l'effet s'exécute uniquement lorsque ces dépendances changent
    Le netttoyage sert à éviter les surplus et fuites de mémoire
  */


  // Incremente le solde chaque crypto-monnaie en fonction de leur cps
  // Crée un intervale pour éxecuter une fonction tout les 1000 ms
  // On clean l'intervalle
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoBalances(prev => {
        const newBalances = { ...prev };
        Object.keys(cps).forEach(crypto => {
          newBalances[crypto] = prev[crypto] + cps[crypto];
        });
        return newBalances;
      });
    }, 1000); // Mise à jour toutes les secondes
    return () => clearInterval(interval);
  }, [cps]);



  // Effet pour récupérer l'historique des prix des cryptomonnaies depuis l'API
  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/price-history`);
        if (!response.ok) throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        const history = await response.json();
        console.log('Updated priceHistory from backend:', history); // Log updated priceHistory
        setPriceHistory(history); // Mettre à jour l'état avec l'historique reçu
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des prix :', error);
        console.log(priceHistory)
      }
    };

    // Mise à jour de l'historique toutes les 5 secondes
    fetchPriceHistory();
    const interval = setInterval(fetchPriceHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Effet pour récupérer les données des utilisateurs pour le classement
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        const sortedData = data.sort((a, b) => b.score - a.score);
        const userIndex = sortedData.findIndex(user => user.name === username);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
        setUserData(sortedData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données des utilisateurs :', error);
      }
    };

    if (isUsernameSet) {
      const interval = setInterval(fetchUserData, 2000);
      return () => clearInterval(interval);
    }
  }, [isUsernameSet, username]);

  // Effet pour mettre à jour le score de l'utilisateur sur le serveur
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
          console.error("Erreur lors de la mise à jour du score :", error);
        }
      }
    };

    const interval = setInterval(updateUserScore, 5000);
    return () => clearInterval(interval);
  }, [isUsernameSet, username, maxUSD]);

  // Gestion de la soumission du nom d'utilisateur
  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true);

      fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, score: maxUSD }),
      })
        .then(() => {
          fetch(`${API_BASE_URL}/api/users`)
            .then(response => response.json())
            .then(data => setUserData(data))
            .catch(error => console.error("Erreur lors de la récupération des données du classement :", error));
        })
        .catch(error => console.error("Erreur lors de la mise à jour du score :", error));
    }
  };

  // Gestion du clic sur une cryptomonnaie pour miner manuellement
  const handleCryptoClick = (crypto) => {
    setCryptoBalances(prev => ({
      ...prev,
      [crypto]: prev[crypto] + 1
    }));
  };

  // Gestion du déblocage d'une nouvelle cryptomonnaie
  const handleUnlockCrypto = (crypto) => {
    const unlockCost = cryptoPrices[crypto] * 1000;
    if (USD >= unlockCost) {
      setUSD(prev => prev - unlockCost);
      setAvailableCryptos(prev => [...prev, crypto]);
    }
  };

  // Gestion de l'achat d'un article dans la boutique
  const handleBuyItem = (crypto, index) => {
    const items = shopItems[crypto];
    const item = items[index];

    if (USD >= item.cost) {
      setUSD(prev => prev - item.cost);
      setShopItems(prev => {
        const newShopItems = { ...prev };
        const newItems = [...prev[crypto]];
        newItems[index] = {
          ...item,
          count: item.count + 1,
          cost: Math.round(item.cost * 1.15),
        };
        newShopItems[crypto] = newItems;
        return newShopItems;
      });
      setCps(prev => ({
        ...prev,
        [crypto]: prev[crypto] + item.bps,
      }));
      setButtonAnimation(prev => ({ ...prev, [`buy-${crypto}-${index}`]: true }));
      setTimeout(() => setButtonAnimation(prev => ({ ...prev, [`buy-${crypto}-${index}`]: false })), 300);
    }
  };

  // Affichage du popup pour acheter une cryptomonnaie
  const handleBuyCryptoPopup = (crypto) => {
    setSelectedCrypto(crypto);
    setCryptoAmount(0);
    setBuyOrSell('buy');
    setShowPopup(true);
  };

  
  // Affichage du popup pour vendre une cryptomonnaie
  const handleSellCryptoPopup = (crypto) => {
    setSelectedCrypto(crypto);
    setCryptoAmount(cryptoBalances[crypto]);
    setBuyOrSell('sell');
    setShowPopup(true);
  };


  // Update the price calculation to use priceHistory
  const handleCryptoAmountChange = (value) => {
    const currentPrice = priceHistory[cryptoFullNames[selectedCrypto]][19];
    if (buyOrSell === 'buy') {
      const maxAffordable = Math.floor(USD / currentPrice);
      setCryptoAmount(Math.min(Math.max(0, value), maxAffordable));
    } else {
      setCryptoAmount(Math.min(Math.max(0, value), cryptoBalances[selectedCrypto]));
    }
  };


  // Confirmation de la transaction
  const handleConfirmTransaction = () => {
    if (cryptoAmount <= 0) {
      setShowPopup(false);
      return;
    }

    const currentPrice = priceHistory[cryptoFullNames[selectedCrypto]][19];
    if (buyOrSell === 'buy') {
      const totalCost = cryptoAmount * currentPrice;
      setUSD(prev => prev - totalCost);
      setCryptoBalances(prev => ({
        ...prev,
        [selectedCrypto]: prev[selectedCrypto] + cryptoAmount
      }));
    } else {
      const totalGain = cryptoAmount * currentPrice;
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


  // Rendu du graphique des prix des cryptomonnaies
  const renderChart = (crypto) => {
    const currentPrice = priceHistory[cryptoFullNames[crypto]][19].toFixed(2);
    // Préparer les données pour le graphique
    const data = {
      labels: Array.from({ length: priceHistory[cryptoFullNames[crypto]].length }, (_, i) => `T-${priceHistory[cryptoFullNames[crypto]].length - i}`),
      datasets: [
        {
          label: `${crypto} Price`,
          data: priceHistory[cryptoFullNames[crypto]],
          segment: {
            borderColor: (ctx) => {
              const { p0, p1 } = ctx;
              return p1.raw > p0.raw ? '#069506' : '#c22929'; // Vert si augmentation, rouge si diminution
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
  
    // Options de configuration du graphique
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#069506' },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#069506' },
        },
      },
      plugins: {
        legend: { labels: { color: '#069506' } },
      },
    };
  
    // Rendu du graphique
    return (
      <div key={crypto} className="chart-container">
        <h3>
          {cryptoFullNames[crypto]} : {currentPrice}
        </h3>
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

  // Filtrage des utilisateurs pour l'affichage du classement
  const getLeaderboardUsers = () => {
    if (!userData || userData.length === 0) return [];
    const result = [];
    for (let i = 0; i < Math.min(3, userData.length); i++) {
      result.push(userData[i]);
    }
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

  // Rendu de l'écran de saisie du nom d'utilisateur
  if (!isUsernameSet) {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="UsernameTitle">Welcome to</h1>
          <h1 className="UsernameTitle2">Crypto Miner</h1>
          <h1 className="Ask-username">Enter your username</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
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

  // Récupération de la prochaine cryptomonnaie déblocable
  const nextCrypto = getNextUnlockableCrypto();

  return (
    <div className="App">
      {!showLeaderboard && (
        <div className="App-main">
          <h1>Crypto Market Simulator</h1>
          <div className="balances-container">
            <div className="balance-item1">
              <p>USD Balance: ${USD.toFixed(2)}</p>
              <p>Max USD Balance: ${maxUSD.toFixed(2)}</p>
            </div>
            <div className="crypto-balances">
              {availableCryptos.map(crypto => (
                <div 
                  key={crypto} 
                  className={`balance-item ${selectedCryptoForShop === crypto ? 'highlighted' : ''}`}
                  title={cryptoDescriptions[crypto]}
                >
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
                      title={`${cryptoFullNames[crypto]}: ${cryptoDescriptions[crypto]}`}
                      onClick={() => {
                        handleCryptoClick(crypto);
                        handleCryptoLogoClick(crypto);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="App-sidebar">
        <h2>Mining Shop</h2>
        {nextCrypto && (
          <div className="shop-item">
            <p>Unlock {cryptoFullNames[nextCrypto]}</p>
            <button onClick={() => handleUnlockCrypto(nextCrypto)}>
              ${(cryptoPrices[nextCrypto] * 1000).toFixed(2)}
            </button>
          </div>
        )}
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
      <div className="App-currencies">
        <h2>Crypto-Market</h2>
        <div className="App-currencies-title">
          {availableCryptos.map(crypto => renderChart(crypto))}
        </div>
      </div>
      <button class="vertical-button" onClick={() => setShowLeaderboard(prev => !prev)}>
        {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
      </button>
      {showLeaderboard && (
        <div className="leaderboard-title">
          <h1>Crypto Market Simulator</h1>
        </div>
      )}
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
                      <td>${(user.score || 0).toFixed(2)}</td>
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
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{buyOrSell === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}</h3>
            <p>Price per unit: ${priceHistory[cryptoFullNames[selectedCrypto]][19].toFixed(6)}</p>
            <input
              type="number"
              value={cryptoAmount}
              onChange={(e) => handleCryptoAmountChange(Number(e.target.value))}
              placeholder={`Enter amount to ${buyOrSell}`}
            />
            {buyOrSell === 'buy' ? (
              <p>
                ${USD.toFixed(2)} - ${(cryptoAmount * priceHistory[cryptoFullNames[selectedCrypto]][19]).toFixed(2)} = $
                {(USD - cryptoAmount * priceHistory[cryptoFullNames[selectedCrypto]][19]).toFixed(2)}
              </p>
            ) : (
              <p>
                ${USD.toFixed(2)} + ${(cryptoAmount * priceHistory[cryptoFullNames[selectedCrypto]][19]).toFixed(2)} = $
                {(USD + cryptoAmount * priceHistory[cryptoFullNames[selectedCrypto]][19]).toFixed(2)}
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
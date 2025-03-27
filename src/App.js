import React, { useState, useEffect } from 'react';
import bitcoin from './bitcoin.png';
import './App.css';

function App() {
  const [counter, setCounter] = useState(0); // State for the number of bitcoins
  const [bps, setBps] = useState(0); // State for bitcoins per 
  const [items, setItems] = useState([
    { name: 'ASIC Miner', cost: 10, count: 0, bps: 1 },
    { name: 'GPU Miner', cost: 100, count: 0, bps: 10 },
    { name: 'Mining Farm', cost: 1000, count: 0, bps: 100 },
  ]); // State for shop items
  const [isOptionsOpen, setIsOptionsOpen] = useState(false); // State for options modal
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [clickValue, setClickValue] = useState(1); // BTC per click
  const [clickAnimation, setClickAnimation] = useState(false); // State for "+X" animation
  const [animationPosition, setAnimationPosition] = useState({ top: 0, left: 0 }); // Position for animation
  const [userData, setUserData] = useState([]); // State to store fetched user data

  // Load the counter and items from localStorage when the component mounts
  useEffect(() => {
    const savedCounter = localStorage.getItem('counter');
    if (savedCounter) {
      setCounter(parseInt(savedCounter));
    }
    const savedItems = localStorage.getItem('items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Save the counter and items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('counter', counter);
    localStorage.setItem('items', JSON.stringify(items));
  }, [counter, items]);

  // Increment counter based on the number of items every second
  useEffect(() => {
    const interval = setInterval(() => {
      const totalBps = items.reduce((sum, item) => sum + item.count * item.bps, 0);
      setCounter(prevCounter => prevCounter + totalBps);
      setBps(totalBps);
    }, 1000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [items]);


  // Handle click event on the Bitcoin logo
  const handleClick = (event) => {
    setCounter(prevCounter => prevCounter + clickValue);

    // Get the bounding rectangle of the logo
    const rect = event.target.getBoundingClientRect();
    const logoCenterX = rect.left + rect.width / 2; // X-coordinate of the center
    const logoCenterY = rect.top + rect.height / 2; // Y-coordinate of the center

    // Generate random position around the center of the logo
    const minRadius = rect.width / 2 + 10; // Minimum radius (just outside the logo)
    const maxRadius = 100; // Maximum radius
    const randomRadius = Math.random() * (maxRadius - minRadius) + minRadius; // Random radius between min and max
    const randomAngle = Math.random() * 2 * Math.PI; // Random angle in radians
    const randomTop = Math.sin(randomAngle) * randomRadius; // Y-offset
    const randomLeft = Math.cos(randomAngle) * randomRadius; // X-offset

    setAnimationPosition({
      top: logoCenterY + randomTop - rect.top, // Adjust relative to the logo's top
      left: logoCenterX + randomLeft - rect.left, // Adjust relative to the logo's left
    });

    setClickAnimation(true); // Trigger animation
    setTimeout(() => setClickAnimation(false), 300); // Remove animation after 300ms
  };

  // Handle buying an item
  const handleBuyItem = (index) => {
    const item = items[index];
    if (counter >= item.cost) {
      const newCounter = counter - item.cost;
      const newItems = [...items];
      newItems[index] = {
        ...item,
        count: item.count + 1,
        cost: item.cost * 2, // Increase cost for next purchase
      };
      setCounter(newCounter);
      setItems(newItems);

      // Recalculate and update BPS immediately
      const totalBps = newItems.reduce((sum, item) => sum + item.count * item.bps, 0);
      setBps(totalBps);
    }
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode', !isDarkMode); // Toggle dark mode class on body
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched user data:", data); // Log fetched data in the browser console
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to fetch user data. Check the console for details.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-shop">
          <h2>Shop</h2>
          {items.map((item, index) => (
            <div key={index} className="shop-item">
              <p>{item.name}</p>
              <p>Cost: {item.cost} BTC</p>
              <p>Count: {item.count}</p>
              <p>BPS: {item.bps}</p> {/* Add BPS information */}
              <button onClick={() => handleBuyItem(index)}>Buy</button>
            </div>
          ))}
        </div>
        <div className="App-main">
          <button className="DarkMode-button" onClick={toggleDarkMode}>
            {isDarkMode ? 'Day Mode' : 'Night Mode'}
          </button>
          <h1>TCrypto</h1> {/* Updated title */}
          <p>Bitcoins: {counter}</p>
          <p>Bitcoins per second: {bps}</p>
          <div className="Bitcoin-container">
            <img
              src={bitcoin}
              className="Bitcoin-logo"
              alt="bitcoin"
              onClick={handleClick}
            />
            {clickAnimation && (
              <span
                className="Click-animation"
                style={{
                  top: `${animationPosition.top}px`,
                  left: `${animationPosition.left}px`,
                }}
              >
                +{clickValue}
              </span>
            )}
          </div>
        </div>
        <div className="App-leaderboard">
          <h2>Leaderboard</h2>
          <button onClick={fetchUserData}>Fetch Leaderboard</button>
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
            <p>No data available. Click "Fetch Leaderboard" to load data.</p>
          )}
        </div>
      </header>
      {isOptionsOpen && (
        <div className="Options-modal">
          <div className="Options-content">
            <h2>Settings</h2>
            <p>Adjust your preferences here:</p>
            <label>
              <input type="checkbox" /> Enable sound
            </label>
            <label>
              <input type="checkbox" /> Dark mode
            </label>
            <button onClick={toggleOptions}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
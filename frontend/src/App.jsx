import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [gameState, setGameState] = useState(null);

  const backendUrl = import.meta.env?.VITE_BACKEND_URL || 'https://mashaf.pythonanywhere.com';

  const initializeGame = async () => {
    try {
      // Localhost ko backendUrl se replace kar diya gaya hai
      const response = await axios.post(`${backendUrl}/api/init`, { rows, cols });
      setGameState(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMove = async (r, c) => {
    if (!gameState.is_alive) return;
    
    const isAdjacent = 
      (Math.abs(gameState.agent_pos[0] - r) === 1 && gameState.agent_pos[1] === c) ||
      (Math.abs(gameState.agent_pos[1] - c) === 1 && gameState.agent_pos[0] === r);

    if (isAdjacent) {
      try {
        // Yahan bhi Localhost ko backendUrl se replace kar diya gaya hai
        const response = await axios.post(`${backendUrl}/api/move`, { r, c });
        setGameState(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getCellClass = (r, c) => {
    if (!gameState) return 'cell gray';
    
    const isVisited = gameState.visited.some(v => v[0] === r && v[1] === c);
    const isSafe = gameState.safe_cells.some(s => s[0] === r && s[1] === c);
    const isAgent = gameState.agent_pos[0] === r && gameState.agent_pos[1] === c;
    const isWumpus = !gameState.is_alive && gameState.wumpus_pos[0] === r && gameState.wumpus_pos[1] === c;
    const isPit = !gameState.is_alive && gameState.pits.some(p => p[0] === r && p[1] === c);

    if (isWumpus || isPit) return 'cell red';
    if (isAgent) return 'cell agent';
    if (isVisited || isSafe) return 'cell green';
    
    return 'cell gray';
  };

  if (!gameState) {
    return (
      <div className="setup-container">
        <h1>Dynamic Wumpus Logic Agent</h1>
        <div className="inputs">
          <label>Rows: <input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} min="2" max="10"/></label>
          <label>Cols: <input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} min="2" max="10"/></label>
          <button onClick={initializeGame}>Start Environment</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>Wumpus World Inference Engine</h1>
      
      <div className="dashboard">
        <div className="metric">
          <h3>Inference Steps</h3>
          <p>{gameState.inference_steps}</p>
        </div>
        <div className="metric">
          <h3>Current Percepts</h3>
          <p>{gameState.percepts.length > 0 ? gameState.percepts.join(', ') : 'None'}</p>
        </div>
        <div className="metric">
          <h3>Status</h3>
          <p style={{color: gameState.is_alive ? 'green' : 'red'}}>
            {gameState.is_alive ? 'Alive' : 'Game Over'}
          </p>
        </div>
      </div>

      <div 
        className="grid" 
        style={{ gridTemplateColumns: `repeat(${gameState.cols}, 60px)` }}
      >
        {Array.from({ length: gameState.rows }).map((_, r) => 
          Array.from({ length: gameState.cols }).map((_, c) => (
            <div 
              key={`${r}-${c}`} 
              className={getCellClass(r, c)}
              onClick={() => handleMove(r, c)}
            >
              {gameState.agent_pos[0] === r && gameState.agent_pos[1] === c ? 'A' : ''}
              {!gameState.is_alive && gameState.wumpus_pos[0] === r && gameState.wumpus_pos[1] === c ? 'W' : ''}
              {!gameState.is_alive && gameState.pits.some(p => p[0] === r && p[1] === c) ? 'P' : ''}
            </div>
          ))
        )}
      </div>

      <button onClick={() => setGameState(null)} className="reset-btn">
        New Game
      </button>
    </div>
  );
};

export default App;

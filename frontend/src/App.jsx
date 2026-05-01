import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [gameState, setGameState] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const backendUrl = import.meta.env?.VITE_BACKEND_URL || 'https://mashaf.pythonanywhere.com';

  const initializeGame = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/init`, { rows, cols });
      setGameState(response.data);
      setIsAutoPlaying(false);
    } catch (error) {
      console.error("Game Init Error:", error);
    }
  };

  const handleMove = async (r, c) => {
    if (!gameState || !gameState.is_alive) return;
    
    const isAdjacent = 
      (Math.abs(gameState.agent_pos[0] - r) === 1 && gameState.agent_pos[1] === c) ||
      (Math.abs(gameState.agent_pos[1] - c) === 1 && gameState.agent_pos[0] === r);

    if (isAdjacent) {
      try {
        const response = await axios.post(`${backendUrl}/api/move`, { r, c });
        setGameState(response.data);
      } catch (error) {
        console.error("Move Error:", error);
      }
    }
  };

  // ==========================================
  // AI LOGIC ENGINE (With Debugging Logs)
  // ==========================================
  const makeIntelligentMove = () => {
    console.log("🤖 AI is thinking...");
    
    if (!gameState || !gameState.is_alive) {
      console.log("❌ Game over or not ready.");
      setIsAutoPlaying(false);
      return;
    }

    const [r, c] = gameState.agent_pos;
    console.log(`📍 Current Position: [${r}, ${c}]`);
    
    const adjacent = [
      [r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]
    ].filter(([nr, nc]) => nr >= 0 && nr < gameState.rows && nc >= 0 && nc < gameState.cols);

    // Fallback if backend arrays are missing
    const visited = gameState.visited || [];
    const safe_cells = gameState.safe_cells || [];

    const unvisitedAdjacent = adjacent.filter(([nr, nc]) =>
      !visited.some(v => v[0] === nr && v[1] === nc)
    );

    const safeAdjacent = adjacent.filter(([nr, nc]) =>
      safe_cells.some(s => s[0] === nr && s[1] === nc)
    );

    const unvisitedSafe = safeAdjacent.filter(([nr, nc]) =>
      !visited.some(v => v[0] === nr && v[1] === nc)
    );

    let nextMove;

    if (unvisitedSafe.length > 0) {
      nextMove = unvisitedSafe[Math.floor(Math.random() * unvisitedSafe.length)];
      console.log("✅ AI Decision: Moving to NEW Safe Cell", nextMove);
    } else if (safeAdjacent.length > 0) {
      nextMove = safeAdjacent[Math.floor(Math.random() * safeAdjacent.length)];
      console.log("🔄 AI Decision: Backtracking to Old Safe Cell", nextMove);
    } else if (unvisitedAdjacent.length > 0) {
      nextMove = unvisitedAdjacent[Math.floor(Math.random() * unvisitedAdjacent.length)];
      console.log("⚠️ AI Decision: TAKING A RISK!", nextMove);
    } else {
      console.log("🛑 AI Decision: Stuck! Nowhere to go.");
      setIsAutoPlaying(false);
      return;
    }

    handleMove(nextMove[0], nextMove[1]);
  };

  // The AI Loop
  useEffect(() => {
    let timer;
    if (isAutoPlaying && gameState && gameState.is_alive) {
      console.log("⏳ Waiting 800ms for next move...");
      timer = setTimeout(() => {
        makeIntelligentMove();
      }, 800);
    } else if (gameState && !gameState.is_alive) {
      console.log("☠️ Agent died or won. Stopping AI.");
      setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, gameState]);
  // ==========================================

  const getCellClass = (r, c) => {
    if (!gameState) return 'cell gray';
    
    const isVisited = gameState.visited?.some(v => v[0] === r && v[1] === c);
    const isSafe = gameState.safe_cells?.some(s => s[0] === r && s[1] === c);
    const isAgent = gameState.agent_pos[0] === r && gameState.agent_pos[1] === c;
    const isWumpus = !gameState.is_alive && gameState.wumpus_pos[0] === r && gameState.wumpus_pos[1] === c;
    const isPit = !gameState.is_alive && gameState.pits?.some(p => p[0] === r && p[1] === c);

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
          <p>{gameState.percepts?.length > 0 ? gameState.percepts.join(', ') : 'None'}</p>
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
              {!gameState.is_alive && gameState.pits?.some(p => p[0] === r && p[1] === c) ? 'P' : ''}
            </div>
          ))
        )}
      </div>

      <div className="controls" style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)} 
          className="auto-play-btn"
          style={{ 
            backgroundColor: isAutoPlaying ? '#ff4757' : '#2ed573', 
            color: 'white', 
            marginRight: '10px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isAutoPlaying ? '⏸️ Pause AI' : '▶️ Start AI Auto-Play'}
        </button>

        <button 
          onClick={() => { setGameState(null); setIsAutoPlaying(false); }} 
          className="reset-btn"
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          🔄 New Game
        </button>
      </div>
    </div>
  );
};

export default App;

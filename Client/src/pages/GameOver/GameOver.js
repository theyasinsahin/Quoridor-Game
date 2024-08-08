import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './GameOver.css';

const GameOver = () => {
  const location = useLocation();
  const { winner } = location.state || { winner: 'Unknown' };

  return (
    <div>
      <h1>Game Over</h1>
      <p>{winner} wins!</p>
      <Link to="/">Play Again</Link>
    </div>
  );
};

export default GameOver;
